import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TodoItem } from '../models/todo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = environment.apiUrl + '/api/todo';

  constructor(private http: HttpClient) { }

  // Get all todos
  getTodos(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(this.apiUrl);
  }

  // Get a specific todo by ID
  getTodo(id: number): Observable<TodoItem> {
    return this.http.get<TodoItem>(`${this.apiUrl}/${id}`);
  }

  // Create a new todo
  createTodo(todo: TodoItem): Observable<TodoItem> {
    return this.http.post<TodoItem>(this.apiUrl, todo);
  }

  // Update an existing todo
  updateTodo(id: number, todo: TodoItem): Observable<any> {
    console.log(`Sending PUT request to ${this.apiUrl}/${id}`, todo);
    return this.http.put(`${this.apiUrl}/${id}`, todo);
  }

  // Delete a todo
  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
