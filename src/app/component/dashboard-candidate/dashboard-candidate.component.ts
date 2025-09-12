import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from 'src/app/services/profile.service';
import { SupaService } from 'src/app/services/supa.service';

@Component({
  selector: 'app-dashboard-candidate',
  templateUrl: './dashboard-candidate.component.html',
  styleUrls: ['./dashboard-candidate.component.css'],
})
export class DashboardCandidateComponent implements OnInit, OnDestroy {
  currentUser: any;
  isProfileIncomplete: boolean = false;
  userData: any;
  updatedUserData: any;
  user: any;

  constructor(
    private supaService: SupaService,
    private router: Router,
    private toastr: ToastrService,
    private profileService: ProfileService
  ) {}

  async ngOnInit() {
    try {
      this.currentUser = await this.supaService.getCurrentUser();
      console.log('Logged in user:', this.currentUser);
      console.log(this.currentUser.user_metadata);
      if (this.currentUser) {
        await this.supaService.saveUserData(this.currentUser);
        console.log('User data saved successfully!');
      }
      this.checkProfileCompletion();
      this.loadCandidateDetails();
      
      // Set up sidebar overlay listener
      this.setupOverlayListener();
    } catch (error) {
      console.error('Error retrieving or saving user data:', error);
    }
  }

  ngOnDestroy(): void {
    // Clean up event listeners when component is destroyed
    this.removeOverlayListener();
  }

  checkProfileCompletion() {
    // First check if user and user_metadata exist
    if (!this.currentUser || !this.currentUser.user_metadata) {
      this.isProfileIncomplete = true; // If we don't have user data, profile is incomplete
      return;
    }
    
    const { phone_number, skills } = this.currentUser.user_metadata;
    
    this.isProfileIncomplete = !phone_number || !skills || phone_number.trim() === '' || (Array.isArray(skills) && skills.length === 0);
    
    console.log("Profile incomplete:", this.isProfileIncomplete);
  }

  async loadCandidateDetails() {
    this.user = await this.supaService.getCurrentUser();
    if (this.user) {
      this.userData = await this.profileService.getCandidateDetails(this.user.id);
      console.log("Raw Data from Supabase:", this.userData);
  
      if (!this.userData || Object.keys(this.userData).length === 0) {
        console.error("Error: No user data found or empty object.");
        return;
      }
  
      this.updatedUserData = { ...this.userData }; 
      console.log("Copied Data for Editing:", this.updatedUserData);
    }
  }

  // Sidebar toggle functionality
  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
      if (sidebar.classList.contains('-translate-x-full')) {
        // Show sidebar
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
      } else {
        // Hide sidebar
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
        overlay.classList.add('hidden');
      }
    }
  }

  // Close sidebar (can be called from template or programmatically)
  closeSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
      overlay.classList.add('hidden');
    }
  }

  // Set up overlay click listener
  private setupOverlayListener(): void {
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', this.handleOverlayClick.bind(this));
    }
  }

  // Remove overlay click listener
  private removeOverlayListener(): void {
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.removeEventListener('click', this.handleOverlayClick.bind(this));
    }
  }

  // Handle overlay click
  private handleOverlayClick(): void {
    this.closeSidebar();
  }

  // Navigation methods (updated to close sidebar on mobile)
  goToProfile() {
    this.closeSidebar(); // Close sidebar on navigation (mobile)
    this.router.navigate(['candidate-dashboard/profile']);
  }

  goToCompanies() {
    this.closeSidebar(); // Close sidebar on navigation (mobile)
    this.router.navigate(['candidate-dashboard/company']);
  }

  goToHome() {
    this.closeSidebar(); // Close sidebar on navigation (mobile)
    this.router.navigate(['candidate-dashboard/']);
  }

  goToJob() {
    this.closeSidebar(); // Close sidebar on navigation (mobile)
    this.router.navigate(['candidate-dashboard/job']);
  }

  async logout() {
    this.closeSidebar(); // Close sidebar before logout
    await this.supaService.signOut();
    this.router.navigate(['/login']);
  }
}