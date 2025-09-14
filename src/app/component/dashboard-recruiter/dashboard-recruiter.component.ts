import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SupaService } from 'src/app/services/supa.service';

@Component({
  selector: 'app-dashboard-recruiter',
  templateUrl: './dashboard-recruiter.component.html',
  styleUrls: ['./dashboard-recruiter.component.css']
})
export class DashboardRecruiterComponent {
  currentUser: any;
  isProfileIncomplete: boolean = false;
  mobileMenuOpen: boolean = false; // Add this property for mobile menu state

  constructor(
    private supaService: SupaService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  async ngOnInit() {
    try {
      this.currentUser = await this.supaService.getCurrentUser();
      console.log('Logged in user:', this.currentUser);

      if (this.currentUser) {
        await this.supaService.saveUserData(this.currentUser);
        console.log('User data saved successfully!');
      }
      this.checkProfileCompletion();
    } catch (error) {
      console.error('Error retrieving or saving user data:', error);
    }
  }

  checkProfileCompletion() {
    if (!this.currentUser) return;

    const { company_name, phone_number } = this.currentUser.user_metadata;

    if (!company_name || !phone_number) {
      this.isProfileIncomplete = true;
    }
  }

  // Add method to toggle mobile menu
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // Add method to close mobile menu when navigating
  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  goToProfile() {
    this.isProfileIncomplete = false;
    this.closeMobileMenu(); // Close mobile menu on navigation
    this.router.navigate(['recruiter-dashboard/profiles']);
  }

  goToHome() {
    this.isProfileIncomplete = false;
    this.closeMobileMenu(); // Close mobile menu on navigation
    this.router.navigate(['recruiter-dashboard']);
  }

  gotoHiring() {
    this.closeMobileMenu(); // Close mobile menu on navigation
    this.router.navigate(['recruiter-dashboard/hiring']);
  }

  async logout() {
    this.closeMobileMenu(); // Close mobile menu on logout
    await this.supaService.signOut();
    this.router.navigate(['/login']);
  }
}