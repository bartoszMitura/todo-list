// filepath: c:\Users\Bartosz.Mitura\RiderProjects\ToDoList\ToDoList-client\src\app\services\auth.guard.ts
import { inject } from '@angular/core';
import { 
  CanActivateFn, 
  Router,
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  UrlTree
} from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    // Check if route requires specific roles
    const roles = route.data?.['roles'] as string[] | undefined;
    
    if (roles && roles.length > 0) {
      // Check if user has required role
      const hasRole = roles.some((role: string) => authService.hasRole(role));
      if (!hasRole) {
        // Redirect to unauthorized page if user doesn't have required role
        return router.parseUrl('/unauthorized');
      }
    }
    
    return true;
  }
  
  // Redirect to login page with return url
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
