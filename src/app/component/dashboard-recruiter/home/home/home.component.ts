import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from 'src/app/services/profile.service';
import { SupaService } from 'src/app/services/supa.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
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

  async ngOnInit(){
    this.loadCandidateDetails();
  }
  async loadCandidateDetails() {
    this.user = await this.supaService.getCurrentUser();
    if (this.user) {
      this.userData = await this.profileService.getRecruiterDetails(this.user.id);
      console.log("Raw Data from Supabase:", this.userData);
  
      if (!this.userData || Object.keys(this.userData).length === 0) {
        console.error("Error: No user data found or empty object.");
        return;
      }
  
      this.updatedUserData = { ...this.userData }; 
      console.log("Copied Data for Editing:", this.updatedUserData);
    }
  }
}
