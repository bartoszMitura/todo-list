import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { TodoService } from '../../services/todo.service';
import { TodoItem, TaskStatus } from '../../models/todo.model';
import { TaskItemComponent } from '../task-item/task-item.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, TaskItemComponent],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss']
})
export class KanbanComponent implements OnInit {
  notStartedTasks: TodoItem[] = [];
  inProgressTasks: TodoItem[] = [];
  completedTasks: TodoItem[] = [];
  delayedTasks: TodoItem[] = [];
  cancelledTasks: TodoItem[] = [];
  
  // All tasks before filtering
  allTasks: TodoItem[] = [];
  
  loading = false;
  statusMap = new Map<string, TaskStatus>([
    ['notStarted', TaskStatus.NotStarted],
    ['inProgress', TaskStatus.InProgress],
    ['completed', TaskStatus.Completed],
    ['delayed', TaskStatus.Delayed],
    ['cancelled', TaskStatus.Cancelled]
  ]);
  
  // Filter visibility
  filtersVisible: boolean = false;

  // Date filter type
  dateFilterType: 'all' | 'today' | 'tomorrow' | 'custom' = 'all';

  // Filter dates
  filterStart: Date | null = null;
  filterEnd: Date | null = null;
  
  constructor(
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.loadTasks();
  }
  
  loadTasks(): void {
    this.loading = true;
    this.todoService.getTodos().subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
        this.snackBar.open('Failed to load tasks', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  
  categorizeTasksByStatus(tasks: TodoItem[]): void {
    this.notStartedTasks = tasks.filter(t => t.status === TaskStatus.NotStarted);
    this.inProgressTasks = tasks.filter(t => t.status === TaskStatus.InProgress);
    this.completedTasks = tasks.filter(t => t.status === TaskStatus.Completed);
    this.delayedTasks = tasks.filter(t => t.status === TaskStatus.Delayed);
    this.cancelledTasks = tasks.filter(t => t.status === TaskStatus.Cancelled);
  }
  
  // Toggle filters visibility
  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }
  
  // Apply filters based on date selection
  applyFilters(): void {
    let filteredTasks = [...this.allTasks];
    
    // Apply date filtering
    if (this.dateFilterType !== 'all') {
      filteredTasks = this.filterDatesByType(filteredTasks);
    }
    
    this.categorizeTasksByStatus(filteredTasks);
  }
  
  // Filter tasks by date type
  filterDatesByType(tasks: TodoItem[]): TodoItem[] {
    if (this.dateFilterType === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      return tasks.filter(task => {
        if (!task.startTime) return false;
        const taskDate = new Date(task.startTime);
        return taskDate >= today && taskDate < tomorrow;
      });
    } 
    else if (this.dateFilterType === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(tomorrow.getDate() + 1);
      
      return tasks.filter(task => {
        if (!task.startTime) return false;
        const taskDate = new Date(task.startTime);
        return taskDate >= tomorrow && taskDate < dayAfter;
      });
    }
    else if (this.dateFilterType === 'custom') {
      return tasks.filter(task => {
        if (this.filterStart) {
          const start = new Date(this.filterStart);
          start.setHours(0, 0, 0, 0);
          
          if (!task.startTime || new Date(task.startTime) < start) {
            return false;
          }
        }
        
        if (this.filterEnd) {
          const end = new Date(this.filterEnd);
          end.setHours(23, 59, 59, 999);
          
          if (!task.endTime || new Date(task.endTime) > end) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    return tasks;
  }
  
  // Date filter change handler
  onDateFilterChange(type: 'all' | 'today' | 'tomorrow' | 'custom'): void {
    this.dateFilterType = type;
    
    // Reset custom dates when not in custom mode
    if (type !== 'custom') {
      this.filterStart = null;
      this.filterEnd = null;
    }
    
    this.applyFilters();
  }
  
  // General filter change handler
  onFilterChange(): void {
    this.applyFilters();
  }
  
  // Clear all filters
  clearFilters(): void {
    this.dateFilterType = 'all';
    this.filterStart = null;
    this.filterEnd = null;
    this.applyFilters();
  }
  
  onTaskDrop(event: CdkDragDrop<TodoItem[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within the same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving to a different column
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update the task status
      const task = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromContainerId(event.container.id);
      
      if (task.status !== newStatus) {
        task.status = newStatus;
        this.updateTaskStatus(task);
      }
    }
  }
  
  getStatusFromContainerId(containerId: string): TaskStatus {
    return this.statusMap.get(containerId) || TaskStatus.NotStarted;
  }
  
  updateTaskStatus(task: TodoItem): void {
    if (task && task.id) {
      this.todoService.updateTodo(task.id, task).subscribe({
        next: () => {
          this.snackBar.open(`Task moved to ${TaskStatus[task.status!]}`, 'Close', {
            duration: 2000
          });
        },
        error: (error) => {
          console.error('Error updating task status:', error);
          this.snackBar.open('Failed to update task status', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.loadTasks(); // Reload the original state
        }
      });
    }
  }
  
  deleteTask(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      panelClass: 'confirmation-dialog',
      data: {
        title: 'Delete Task',
        message: 'Are you sure you want to delete this task? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        isWarning: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.todoService.deleteTodo(id).subscribe({
          next: () => {
            // Remove from all arrays
            this.notStartedTasks = this.notStartedTasks.filter(t => t.id !== id);
            this.inProgressTasks = this.inProgressTasks.filter(t => t.id !== id);
            this.completedTasks = this.completedTasks.filter(t => t.id !== id);
            this.delayedTasks = this.delayedTasks.filter(t => t.id !== id);
            this.cancelledTasks = this.cancelledTasks.filter(t => t.id !== id);
            
            this.snackBar.open('Task deleted successfully', 'Close', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error deleting task:', error);
            this.snackBar.open('Failed to delete task', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
      }
    });
  }
}
