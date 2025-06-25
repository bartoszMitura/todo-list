import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { MaterialModule } from './material.module';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    HeaderComponent, 
    MaterialModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ToDoList-client';
  
  constructor(public authService: AuthService) {}
  
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
}
