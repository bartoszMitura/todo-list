using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ToDoList.Models.Auth;

namespace ToDoList.Models
{
    public enum TaskStatus
    {
        NotStarted,
        InProgress,
        Completed,
        Delayed,
        Cancelled
    }

    public class TodoItem
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;
        
        public bool IsCompleted { get; set; }
        
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        
        // New properties for enhanced functionality
        public DateTime? StartTime { get; set; }
        
        public DateTime? EndTime { get; set; }
        
        [StringLength(50)]
        public string? Category { get; set; }
        
        public TaskStatus Status { get; set; } = TaskStatus.NotStarted;
        
        // Foreign key for user
        public string? UserId { get; set; }
        
        // Navigation property to the user
        [ForeignKey("UserId")]
        public virtual ApplicationUser? User { get; set; }
    }
}
