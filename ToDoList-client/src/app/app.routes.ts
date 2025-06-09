import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './services/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Home route that requires authentication
  { 
    path: '', 
    component: HomeComponent,
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
