import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { TodoItem, TaskStatus } from '../../models/todo.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  submitting = false;
  isEdit = false;
  taskId: number | null = null;

  constructor(
    private todoService: TodoService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.taskForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      startTime: [null],
      endTime: [null],
      category: [''],
      status: [0], // Default to "Not Started"
      isCompleted: [false]
    });
  }

  ngOnInit(): void {
    // Check if we're editing an existing task
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.taskId = +params['id'];
        this.loadTask(this.taskId);
      }
    });
  }

  loadTask(id: number): void {
    this.todoService.getTodo(id).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          startTime: task.startTime,
          endTime: task.endTime,
          category: task.category || '',
          status: task.status !== undefined ? task.status : 0,
          isCompleted: task.isCompleted
        });
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.snackBar.open('Failed to load task details', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
        this.router.navigate(['/']);
      }
    });
  }

  saveTask(): void {
    // Stop if form is invalid
    if (this.taskForm.invalid) {
      return;
    }

    const taskData: TodoItem = {
      title: this.taskForm.value.title,
      isCompleted: this.taskForm.value.isCompleted,
      startTime: this.taskForm.value.startTime ? new Date(this.taskForm.value.startTime) : undefined,
      endTime: this.taskForm.value.endTime ? new Date(this.taskForm.value.endTime) : undefined,
      category: this.taskForm.value.category || '',
      status: this.taskForm.value.status
    };

    this.submitting = true;

    if (this.isEdit && this.taskId) {
      // Update existing task
      this.todoService.updateTodo(this.taskId, taskData).subscribe({
        next: () => {
          this.submitting = false;
          this.snackBar.open('Task updated successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.submitting = false;
          this.snackBar.open('Failed to update task', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
    } else {
      // Create new task
      this.todoService.createTodo(taskData).subscribe({
        next: () => {
          this.submitting = false;
          this.snackBar.open('Task created successfully', 'Close', {
            duration: 3000,
          });
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.submitting = false;
          this.snackBar.open('Failed to create task', 'Close', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  onSubmit(): void {
    this.saveTask();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
