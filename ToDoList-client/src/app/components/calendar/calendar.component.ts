import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { TodoService } from '../../services/todo.service';
import { TodoItem, TaskStatus } from '../../models/todo.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: TodoItem[];
}

interface CalendarWeek {
  days: CalendarDay[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  loading = false;
  currentDate: Date = new Date();
  calendarWeeks: CalendarWeek[] = [];
  tasks: TodoItem[] = [];
  weekdays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  selectedTask: TodoItem | null = null;
  
  constructor(
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}
  
  ngOnInit() {
    this.loadTasks();
  }
  
  loadTasks() {
    this.loading = true;
    this.todoService.getTodos().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.generateCalendar();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.snackBar.open('Failed to load tasks', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
        this.loading = false;
      }
    });
  }
  
  generateCalendar() {
    this.calendarWeeks = [];
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Get first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Get last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get day of week of first day (0-6, 0 is Sunday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Start date will be the first date shown on the calendar (could be from previous month)
    const startDate = new Date(year, month, 1 - daysFromPrevMonth);
    
    // We'll show 6 weeks (42 days) to ensure we have enough rows for all months
    const totalDaysToShow = 42;
    
    let currentWeek: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < totalDaysToShow; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      currentDate.setHours(0, 0, 0, 0); // Reset time part to compare dates correctly
      
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.getTime() === today.getTime();
      
      // Filter tasks for this day
      const tasksForDay = this.tasks.filter(task => {
        if (!task.startTime) return false;
        
        const taskDate = new Date(task.startTime);
        return taskDate.getDate() === currentDate.getDate() && 
               taskDate.getMonth() === currentDate.getMonth() && 
               taskDate.getFullYear() === currentDate.getFullYear();
      });
      
      currentWeek.push({
        date: currentDate,
        isCurrentMonth,
        isToday,
        tasks: tasksForDay
      });
      
      // If we've added 7 days or reached the end, start a new week
      if (currentWeek.length === 7 || i === totalDaysToShow - 1) {
        this.calendarWeeks.push({ days: [...currentWeek] });
        currentWeek = [];
      }
    }
  }
  
  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }
  
  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }
  
  currentMonth() {
    this.currentDate = new Date();
    this.generateCalendar();
  }
  
  getTaskStatusClass(status: TaskStatus | undefined): string {
    if (status === undefined) {
      return 'status-not-started';
    }
    
    switch (status) {
      case TaskStatus.Completed:
        return 'status-completed';
      case TaskStatus.InProgress:
        return 'status-in-progress';
      case TaskStatus.Delayed:
        return 'status-delayed';
      case TaskStatus.Cancelled:
        return 'status-cancelled';
      default:
        return 'status-not-started';
    }
  }
  
  showTaskDetails(task: TodoItem) {
    this.selectedTask = task;
  }
  
  closeTaskDetails() {
    this.selectedTask = null;
  }
  
  addTask() {
    this.router.navigate(['/task/add']);
  }
  
  editTask(taskId: number | undefined) {
    if (taskId) {
      this.router.navigate(['/task/edit', taskId]);
    }
  }
  
  deleteTask(taskId: number | undefined) {
    if (!taskId) return;
    
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
        this.todoService.deleteTodo(taskId).subscribe({
          next: () => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.generateCalendar();
            this.selectedTask = null;
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
