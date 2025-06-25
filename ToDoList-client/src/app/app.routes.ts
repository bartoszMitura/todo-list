import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './services/auth.guard';
import { TaskListComponent } from './components/task-list/task-list.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { KanbanComponent } from './components/kanban/kanban.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes that require authentication
  { 
    path: '', 
    component: TaskListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'calendar', 
    component: CalendarComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'kanban', 
    component: KanbanComponent,
    canActivate: [authGuard]
  },
  
  // Unauthorized page
  { 
    path: 'unauthorized', 
    component: UnauthorizedComponent
  },
  
  // Wildcard route for 404
  { 
    path: '**', 
    redirectTo: '' 
  }
];
