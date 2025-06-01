import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect to home if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
      this.registerForm = this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      userName: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    // Do any additional initialization if needed
  }

  // Custom validator to check if password and confirm password match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        // Return if another validator has already found an error on the matchingControl
        return;
      }

      // Set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  // Convenience getter for form fields
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;    this.authService.register({
      userName: this.f['userName'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      confirmPassword: this.f['confirmPassword'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value
    })
    .subscribe({
      next: response => {
        this.success = response.message || 'Registration successful';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000); // Redirect after 2 seconds
      },
      error: error => {
        this.error = error.error?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
