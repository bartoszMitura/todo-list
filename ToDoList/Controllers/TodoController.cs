using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.OData.Query;
using ToDoList.Data;
using ToDoList.Models;
using ToDoList.Models.Auth;

namespace ToDoList.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication for all actions
    public class TodoController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public TodoController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/Todo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
                
            return await _context.TodoItems
                .Where(item => item.UserId == userId)
                .ToListAsync();
        }

        // GET: api/Todo/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TodoItem>> GetTodoItem(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
                
            var todoItem = await _context.TodoItems
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

            if (todoItem == null)
                return NotFound();

            return todoItem;
        }

        // GET: api/Todo/odata
        [HttpGet("odata")]
        [EnableQuery]
        public IQueryable<TodoItem> GetTodoItemsOData()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Enumerable.Empty<TodoItem>().AsQueryable();
            return _context.TodoItems.Where(item => item.UserId == userId);
        }

        // PUT: api/Todo/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTodoItem(int id, TodoItem todoItem)
        {
            if (id != todoItem.Id)
                return BadRequest();
                
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
                
            // Verify ownership
            var existingItem = await _context.TodoItems.FindAsync(id);
            if (existingItem == null)
                return NotFound();
                
            if (existingItem.UserId != userId)
                return Forbid();
                  // Transfer user-editable properties
            existingItem.Title = todoItem.Title;
            existingItem.IsCompleted = todoItem.IsCompleted;
            existingItem.StartTime = todoItem.StartTime;
            existingItem.EndTime = todoItem.EndTime;
            existingItem.Category = todoItem.Category;
            existingItem.Status = todoItem.Status;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // POST: api/Todo
        [HttpPost]
        public async Task<ActionResult<TodoItem>> PostTodoItem(TodoItem todoItem)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
                
            // Set the current user as the owner
            todoItem.UserId = userId;
            todoItem.CreatedAt = DateTime.UtcNow;
            
            _context.TodoItems.Add(todoItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTodoItem), new { id = todoItem.Id }, todoItem);
        }

        // DELETE: api/Todo/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodoItem(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();
                
            var todoItem = await _context.TodoItems.FindAsync(id);
            
            if (todoItem == null)
                return NotFound();
                
            // Verify ownership
            if (todoItem.UserId != userId)
                return Forbid();

            _context.TodoItems.Remove(todoItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TodoItemExists(int id)
        {
            return _context.TodoItems.Any(e => e.Id == id);
        }
    }
}
