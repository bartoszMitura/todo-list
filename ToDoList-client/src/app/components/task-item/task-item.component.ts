import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItem, TaskStatus } from '../../models/todo.model';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss']
})
export class TaskItemComponent {
  @Input() todo!: TodoItem;
  @Output() toggleComplete = new EventEmitter<TodoItem>();
  
  onToggleComplete(): void {
    this.toggleComplete.emit({...this.todo, isCompleted: !this.todo.isCompleted});
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
