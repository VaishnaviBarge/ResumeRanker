import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SupaService } from 'src/app/services/supa.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private supaService: SupaService,
    private router: Router,
    private toastService: ToastService,
  ) {
    console.log("hello bhai");
    
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(7)]],
    });
    console.log("yaha par bhi koi jol nami he bhai");
  }
  
  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
       this.toastService.show('Please fill out all fields correctly.');
      return;
    }
  
    try {
      console.log("Attempting to log in...");
      const { user, session } = await this.supaService.signIn(
        this.loginForm.value.email, 
        this.loginForm.value.password
      );
  
      if (!user) {
        this.errorMessage = 'Invalid login credentials';
        this.toastService.show('Invalid login credentials');
        console.error('Login error: User not found');
        return;
      }
  
      console.log('Logged in successfully:', user);
      this.toastService.show('Logged in successfully!');
      const userRole = user.user_metadata['role'];

      if (!userRole) {
        this.errorMessage = 'User role not found.';
        this.toastService.show('User role not found.');
        console.error('Error: User role is missing in metadata.');
        return;
      }
  
      // Redirect based on role
      if (userRole === 'candidate') {
        this.router.navigate(['/candidate-dashboard']);
      } else if (userRole === 'recruiter') {
        this.router.navigate(['/recruiter-dashboard']);
      } else {
        this.errorMessage = 'Invalid user role.';
        console.error('Invalid user role:', userRole);
        this.router.navigate(['/login']);
      }
  
  
    } catch (err: any) {
      console.error('Login error:', err);
      this.errorMessage = err?.message || 'An unexpected error occurred.';
      this.toastService.show(err?.message || 'An unexpected error occurred.');
    }
  }
  
  
  
}
