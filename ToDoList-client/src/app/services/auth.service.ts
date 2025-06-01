import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private apiUrl = environment.apiUrl + '/api/auth';
    constructor(private http: HttpClient) {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('currentUser');
    let initialUser = storedUser ? JSON.parse(storedUser) : null;
    
    // Check if token is expired
    if (initialUser && initialUser.tokenExpiration) {
      const expiration = new Date(initialUser.tokenExpiration);
      if (expiration <= new Date()) {
        // Token is expired, remove user
        localStorage.removeItem('currentUser');
        initialUser = null;
      }
    }
    
    this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }
  
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  public get isLoggedIn(): boolean {
    return !!this.currentUserValue?.token;
  }
  
  public get token(): string | undefined {
    return this.currentUserValue?.token;
  }
  
  public get userRoles(): string[] {
    return this.currentUserValue?.roles || [];
  }
  
  public hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }
  
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response.success && response.token) {            const user: User = {
              username: response.userName || loginRequest.userName,
              email: response.email || '',
              token: response.token,
              tokenExpiration: response.expiration,
              roles: response.roles
            };
            
            // Store user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerRequest)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
  
  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    if (!user || !user.token) return false;
    
    if (user.tokenExpiration) {
      const expiration = new Date(user.tokenExpiration);
      return expiration > new Date();
    }
    
    // No expiration found, assume not authenticated
    return false;
  }
}
