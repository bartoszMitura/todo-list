using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models
{
    public class TodoItem
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;
        
        public bool IsCompleted { get; set; }
        
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
