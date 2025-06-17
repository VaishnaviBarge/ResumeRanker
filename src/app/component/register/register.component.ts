import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { SupaService } from 'src/app/services/supa.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private supaService: SupaService,
    private toastService: ToastService
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
      username: ['', [Validators.required, Validators.minLength(5)]],
      role: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(7)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  public onSubmit() {
    if (this.registerForm.valid) {
      this.supaService
        .signUp(
          this.registerForm.value.email,
          this.registerForm.value.password,
          this.registerForm.value.username,
          this.registerForm.value.role
        )
        .then((res) => {
          this.toastService.show('Registered successfully! Please confirm your email before logging in.');
        this.registerForm.reset();
        })
        .catch((err) => {
          console.error('Registration error:', err);
          this.toastService.show('Registration failed. Please try again.');
        });
    } else {
      console.error('Form is invalid');
      this.toastService.show('Please fill out the form correctly.', 3000);
    }
  }
}
