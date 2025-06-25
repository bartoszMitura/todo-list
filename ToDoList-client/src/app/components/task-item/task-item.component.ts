import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItem, TaskStatus } from '../../models/todo.model';
import { MaterialModule } from '../../material.module';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss']
})
export class TaskItemComponent {
  @Input() todo!: TodoItem;
  @Output() deleteTask = new EventEmitter<number>();
  
  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  onEditTask(): void {
    if (this.todo && this.todo.id) {
      console.log('Editing task with ID:', this.todo.id);
      this.router.navigate(['/task/edit', this.todo.id]);
    } else {
      console.error('Cannot edit task - missing ID:', this.todo);
      this.snackBar.open('Cannot edit task: Missing task ID', 'Close', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
    }
  }
  
  onDeleteTask(): void {
    if (this.todo && this.todo.id) {
      this.deleteTask.emit(this.todo.id);
    }
  }
  
  getStatusClass(): string {
    if (this.todo.status === undefined) {
      return 'status-not-started';
    }
    
    switch (this.todo.status) {
      case TaskStatus.Completed: // 2
        return 'status-completed';
      case TaskStatus.InProgress: // 1
        return 'status-in-progress';
      case TaskStatus.Delayed: // 3
        return 'status-delayed';
      case TaskStatus.Cancelled: // 4
        return 'status-cancelled';
      default:
        return 'status-not-started';
    }
  }
}
