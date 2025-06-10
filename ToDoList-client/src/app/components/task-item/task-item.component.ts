import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItem } from '../../models/todo.model';
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
}
