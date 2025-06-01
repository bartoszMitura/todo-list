import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Add a temporary home route that requires authentication
  { 
    path: '', 
    loadComponent: () => import('./app.component').then(m => m.AppComponent),
    canActivate: [authGuard]
  },
  
  // Add unauthorized page
  { 
    path: 'unauthorized', 
    loadComponent: () => import('./app.component').then(m => m.AppComponent)
  },
  
  // Wildcard route for 404
  { 
    path: '**', 
    redirectTo: '' 
  }
];
