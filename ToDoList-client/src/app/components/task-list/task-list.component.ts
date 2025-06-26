import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MaterialModule } from '../../material.module';
import { TodoService } from '../../services/todo.service';
import { TodoItem, TaskStatus } from '../../models/todo.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskItemComponent } from '../task-item/task-item.component';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink, TaskItemComponent, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  todos: TodoItem[] = [];
  loading = false;

  // Material table columns
  displayedColumns: string[] = ['title', 'category', 'status', 'startTime', 'endTime', 'menu'];

  // Filtering
  filterStatus: TaskStatus | '' = '';
  filterStart: Date | null = null;
  filterEnd: Date | null = null;
  filterToday = false;
  filterTomorrow = false;
  // Sorting
  sortField: 'startTime' | 'endTime' | 'category' | 'title' | 'status' = 'startTime';
  sortDirection: 'asc' | 'desc' = 'asc';

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

  buildODataQuery(): string {
    const filters: string[] = [];
    let orderBy = '';
    // Filtrowanie po statusie
    if (this.filterStatus !== '') {
      filters.push(`status eq ${this.filterStatus}`);
    }
    // Filtrowanie po dacie (zakres)
    if (this.filterStart) {
      const start = this.filterStart.toISOString();
      filters.push(`startTime ge ${start}`);
    }
    if (this.filterEnd) {
      const end = this.filterEnd.toISOString();
      filters.push(`endTime le ${end}`);
    }
    // Filtr dzisiaj
    if (this.filterToday) {
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
      filters.push(`startTime ge ${today.toISOString()} and startTime lt ${tomorrow.toISOString()}`);
    }
    // Filtr jutro
    if (this.filterTomorrow) {
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0,0,0,0);
      const dayAfter = new Date(tomorrow); dayAfter.setDate(tomorrow.getDate() + 1);
      filters.push(`startTime ge ${tomorrow.toISOString()} and startTime lt ${dayAfter.toISOString()}`);
    }
    // Sortowanie
    if (this.sortField) {
      orderBy = `$orderby=${this.sortField} ${this.sortDirection}`;
    }
    let query = '?';
    if (filters.length > 0) {
      query += `$filter=${filters.join(' and ')}&`;
    }
    if (orderBy) {
      query += orderBy;
    }
    if (query.endsWith('&') || query.endsWith('?')) {
      query = query.slice(0, -1);
    }
    return query;
  }

  loadTodos(): void {
    this.loading = true;
    const odataQuery = this.buildODataQuery();
    this.todoService.getTodosOData(odataQuery).subscribe({
      next: (data) => {
        this.todos = data;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load tasks', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  applyFiltersAndSort(): void {
    this.loadTodos();
  }

  onSortChange(field: 'startTime' | 'endTime' | 'category' | 'title' | 'status') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  onFilterChange() {
    this.applyFiltersAndSort();
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterStart = null;
    this.filterEnd = null;
    this.filterToday = false;
    this.filterTomorrow = false;
    this.applyFiltersAndSort();
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
            this.todos = this.todos.filter(t => t.id !== id);
            this.applyFiltersAndSort();
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
