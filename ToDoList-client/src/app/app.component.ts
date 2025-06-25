import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { MaterialModule } from './material.module';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

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
export class AppComponent implements OnInit {
  title = 'ToDoList-client';
  isKanbanView = false;
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // Track router events to detect when we're on the Kanban view
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isKanbanView = event.url === '/kanban';
    });
  }
  
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
}
