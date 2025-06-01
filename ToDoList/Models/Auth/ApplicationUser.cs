using Microsoft.AspNetCore.Identity;

namespace ToDoList.Models.Auth
{
    // Rozszerzamy standardową klasę IdentityUser, aby móc dodać własne pola w przyszłości
    public class ApplicationUser : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
