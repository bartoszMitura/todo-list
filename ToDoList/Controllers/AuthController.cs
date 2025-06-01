using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ToDoList.Models.Auth;
using ToDoList.Services;

namespace ToDoList.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly JwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            JwtService jwtService,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(new AuthResponse { Success = false, Message = "Invalid input data" });            // Check if user already exists
            var userExists = await _userManager.FindByNameAsync(model.UserName);
            if (userExists != null)
                return Conflict(new AuthResponse { Success = false, Message = "User already exists!" });

            ApplicationUser user = new()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.UserName,
                FirstName = model.FirstName,
                LastName = model.LastName
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("User registration failed: {Errors}", errors);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new AuthResponse { Success = false, Message = $"User creation failed: {errors}" });
            }

            // Add user to the "User" role
            if (!await _roleManager.RoleExistsAsync("User"))
                await _roleManager.CreateAsync(new IdentityRole("User"));

            if (await _roleManager.RoleExistsAsync("User"))
                await _userManager.AddToRoleAsync(user, "User");

            return Ok(new AuthResponse { Success = true, Message = "User created successfully!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(new AuthResponse { Success = false, Message = "Invalid input data" });            var user = await _userManager.FindByNameAsync(model.UserName);
            
            if (user == null)
                return Unauthorized(new AuthResponse { Success = false, Message = "Invalid username" });

            // Check password validity
            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            
            if (!result.Succeeded)
                return Unauthorized(new AuthResponse { Success = false, Message = "Invalid password" });

            // Generate JWT token
            var (token, expiration) = await _jwtService.GenerateJwtToken(user);
            
            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new AuthResponse
            {
                Success = true,
                Token = token,
                Expiration = expiration,
                UserName = user.UserName,
                                Email = user.Email,
                Message = "Login successful",
                Roles = roles.ToList()
            });
        }
    }
}
