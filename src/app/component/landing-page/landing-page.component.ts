import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  constructor(private router: Router) {}
  isMobileMenuOpen = false;
  goToLogin() {
    console.log('Navigating to login...');
    this.closeMobileMenu();
    this.router.navigate(['/login']).catch(err => console.error('Navigation error:', err));
  }
  

  goToRegister() {
    this.closeMobileMenu();
    this.router.navigate(['/register']);
  }


  showModal(userType: string): void {
    const modalTitle = userType === 'job-seeker' ? 'Job Seeker Login' : 'Recruiter Login';
    alert(modalTitle); // Replace with actual modal logic
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

   toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
}