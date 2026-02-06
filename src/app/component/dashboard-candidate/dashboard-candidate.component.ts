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
      
      this.setupOverlayListener();
    } catch (error) {
      console.error('Error retrieving or saving user data:', error);
    }
  }

  ngOnDestroy(): void {
    this.removeOverlayListener();
  }

  checkProfileCompletion() {
    if (!this.currentUser || !this.currentUser.user_metadata) {
      this.isProfileIncomplete = true; 
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

  toggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
      if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
      } else {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
        overlay.classList.add('hidden');
      }
    }
  }

  closeSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
      overlay.classList.add('hidden');
    }
  }

  private setupOverlayListener(): void {
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', this.handleOverlayClick.bind(this));
    }
  }

  private removeOverlayListener(): void {
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.removeEventListener('click', this.handleOverlayClick.bind(this));
    }
  }

  private handleOverlayClick(): void {
    this.closeSidebar();
  }

  goToProfile() {
    this.closeSidebar(); 
    this.router.navigate(['candidate-dashboard/profile']);
  }

  goToCompanies() {
    this.closeSidebar(); 
    this.router.navigate(['candidate-dashboard/company']);
  }

  goToInterview() {
    this.closeSidebar(); 
    this.router.navigate(['candidate-dashboard/interview']);
  }

  goToHome() {
    this.closeSidebar(); 
    this.router.navigate(['candidate-dashboard/']);
  }

  goToJob() {
    this.closeSidebar();
    this.router.navigate(['candidate-dashboard/job']);
  }

  async logout() {
    this.closeSidebar(); 
    await this.supaService.signOut();
    this.router.navigate(['/login']);
  }
}