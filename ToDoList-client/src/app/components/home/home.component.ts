import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MaterialModule } from '../../material.module';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { TodoItem } from '../../models/todo.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskItemComponent } from '../task-item/task-item.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, TaskItemComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  todoForm: FormGroup;
  todos: TodoItem[] = [];
  loading = false;
  submitting = false;
  constructor(
    private authService: AuthService,
    private todoService: TodoService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.todoForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      startTime: [null],
      endTime: [null],
      category: [''],
      status: [0] // 0 = NotStarted in the TaskStatus enum
    });
  }

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
  }  createTodo(): void {
    // Stop if form is invalid
    if (this.todoForm.invalid) {
      return;
    }

    const newTodo: TodoItem = {
      title: this.todoForm.value.title,
      isCompleted: false,
      startTime: this.todoForm.value.startTime ? new Date(this.todoForm.value.startTime) : undefined,
      endTime: this.todoForm.value.endTime ? new Date(this.todoForm.value.endTime) : undefined,
      category: this.todoForm.value.category || '',
      status: this.todoForm.value.status
    };

    console.log('Sending todo:', newTodo); // Debug log to see what's being sent
    this.submitting = true;
    this.todoService.createTodo(newTodo).subscribe({
      next: (result) => {
        this.todos.unshift(result); // Add to the beginning of the array
        this.todoForm.reset();
        this.submitting = false;
        this.snackBar.open('Task created successfully', 'Close', {
          duration: 3000,
        });
      },
      error: (error) => {
        console.error('Error creating todo:', error);
        this.submitting = false;
        this.snackBar.open('Failed to create task', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  

}
