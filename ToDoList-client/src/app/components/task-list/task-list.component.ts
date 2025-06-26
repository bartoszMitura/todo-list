import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MaterialModule } from '../../material.module';
import { TodoService } from '../../services/todo.service';
import { TodoItem, TaskStatus } from '../../models/todo.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskItemComponent } from '../task-item/task-item.component';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
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

  // Search text
  searchText: string = '';

  // Date filter type
  dateFilterType: 'all' | 'today' | 'tomorrow' | 'custom' = 'all';

  // Filter visibility
  filtersVisible: boolean = false;

  // Filtering
  filterStatus: TaskStatus | '' = '';
  filterStart: Date | null = null;
  filterEnd: Date | null = null;
  filterToday = false;
  filterTomorrow = false;
  // Sorting
  sortField: 'startTime' | 'endTime' | 'category' | 'title' | 'status' = 'startTime';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  @ViewChild(MatSort) sort!: MatSort;

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
    
    // Full-text search filtering
    if (this.searchText && this.searchText.trim() !== '') {
      const sanitizedSearch = this.searchText.trim().replace(/'/g, "''");
      filters.push(`(contains(title,'${sanitizedSearch}') or contains(category,'${sanitizedSearch}'))`);
    }
    
    // Status filtering
    if (this.filterStatus !== '') {
      filters.push(`status eq ${this.filterStatus}`);
    }
    
    // Date filtering based on dateFilterType
    if (this.dateFilterType === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayIso = today.toISOString();
      const tomorrowIso = tomorrow.toISOString();
      
      filters.push(`(startTime ge ${this.formatDateForOData(today)} and startTime lt ${this.formatDateForOData(tomorrow)})`);
    } 
    else if (this.dateFilterType === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(tomorrow.getDate() + 1);
      
      filters.push(`(startTime ge ${this.formatDateForOData(tomorrow)} and startTime lt ${this.formatDateForOData(dayAfter)})`);
    }
    else if (this.dateFilterType === 'custom' && (this.filterStart || this.filterEnd)) {
      const dateFilters = [];
      
      if (this.filterStart) {
        const startDate = new Date(this.filterStart);
        startDate.setHours(0, 0, 0, 0);
        dateFilters.push(`startTime ge ${this.formatDateForOData(startDate)}`);
      }
      
      if (this.filterEnd) {
        const endDate = new Date(this.filterEnd);
        endDate.setHours(23, 59, 59, 999);
        dateFilters.push(`endTime le ${this.formatDateForOData(endDate)}`);
      }
      
      if (dateFilters.length > 0) {
        filters.push(`(${dateFilters.join(' and ')})`);
      }
    }
    
    // Sorting
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
  
  // Helper method to format dates for OData
  formatDateForOData(date: Date): string {
    return `datetime'${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}'`;
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
        console.error('Error loading todos:', error);
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

  onSearchChange() {
    this.applyFiltersAndSort();
  }
  
  onDateFilterChange(type: 'all' | 'today' | 'tomorrow' | 'custom') {
    this.dateFilterType = type;
    // When changing the date filter type, reset custom dates
    if (type !== 'custom') {
      this.filterStart = null;
      this.filterEnd = null;
    }
    this.applyFiltersAndSort();
  }

  clearFilters() {
    this.searchText = '';
    this.filterStatus = '';
    this.filterStart = null;
    this.filterEnd = null;
    this.dateFilterType = 'all';
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

  // Handle Material sorting
  handleSortChange(sortEvent: Sort) {
    if (sortEvent.direction === '') {
      this.sortField = 'startTime';
      this.sortDirection = 'asc';
    } else {
      this.sortField = sortEvent.active as any;
      this.sortDirection = sortEvent.direction as 'asc' | 'desc';
    }
    this.applyFiltersAndSort();
  }
  
  // Toggle filters visibility
  toggleFilters() {
    this.filtersVisible = !this.filtersVisible;
  }
  
  // Client-side date filtering
  filterDateClientSide(todos: TodoItem[]): TodoItem[] {
    if (this.dateFilterType === 'all' || !todos) {
      return todos;
    }
    
    if (this.dateFilterType === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      return todos.filter(todo => {
        if (!todo.startTime) return false;
        const taskDate = new Date(todo.startTime);
        return taskDate >= today && taskDate < tomorrow;
      });
    } 
    else if (this.dateFilterType === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(tomorrow.getDate() + 1);
      
      return todos.filter(todo => {
        if (!todo.startTime) return false;
        const taskDate = new Date(todo.startTime);
        return taskDate >= tomorrow && taskDate < dayAfter;
      });
    }
    else if (this.dateFilterType === 'custom') {
      return todos.filter(todo => {
        if (this.filterStart) {
          const start = new Date(this.filterStart);
          start.setHours(0, 0, 0, 0);
          
          if (!todo.startTime || new Date(todo.startTime) < start) {
            return false;
          }
        }
        
        if (this.filterEnd) {
          const end = new Date(this.filterEnd);
          end.setHours(23, 59, 59, 999);
          
          if (!todo.endTime || new Date(todo.endTime) > end) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    return todos;
  }
}
