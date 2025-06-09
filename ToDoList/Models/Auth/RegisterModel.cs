using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models.Auth
{
    public class RegisterModel
    {
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        [System.Text.Json.Serialization.JsonPropertyName("confirmPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;

        public string? FirstName { get; set; }
        
        public string? LastName { get; set; }
    }
}
