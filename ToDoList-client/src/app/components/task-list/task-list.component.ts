import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MaterialModule } from '../../material.module';
import { TodoService } from '../../services/todo.service';
import { TodoItem } from '../../models/todo.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskItemComponent } from '../task-item/task-item.component';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink, TaskItemComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  todos: TodoItem[] = [];
  loading = false;
  
  constructor(
    private authService: AuthService,
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  get username(): string | undefined {
    return this.authService.currentUserValue?.username;
  }

  loadTodos(): void {
    this.loading = true;
    this.todoService.getTodos().subscribe({
      next: (data) => {
        this.todos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading todos:', error);
        this.loading = false;
        this.snackBar.open('Failed to load tasks', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  
  updateTaskStatus(todo: TodoItem): void {
    this.todoService.updateTodo(todo.id!, todo).subscribe({
      next: () => {
        // Update the todo in the list
        const index = this.todos.findIndex(t => t.id === todo.id);
        if (index !== -1) {
          this.todos[index] = todo;
        }
        this.snackBar.open(
          `Task marked as ${todo.isCompleted ? 'completed' : 'active'}`, 
          'Close', 
          { duration: 3000 }
        );
      },
      error: (error) => {
        console.error('Error updating todo:', error);
        this.snackBar.open('Failed to update task status', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  
  deleteTask(id: number): void {
    // Open confirmation dialog
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

    // Subscribe to dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.todoService.deleteTodo(id).subscribe({
          next: () => {
            // Remove the todo from the list
            this.todos = this.todos.filter(t => t.id !== id);
            this.snackBar.open('Task deleted successfully', 'Close', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error deleting todo:', error);
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
