import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import html2pdf from 'html2pdf.js';
import { ProfileService } from 'src/app/services/profile.service';
import { SupaService } from 'src/app/services/supa.service';

@Component({
  selector: 'app-resume-template',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-template.component.html',
  styleUrl: './resume-template.component.css'
})
export class ResumeTemplateComponent {
  candidateData: any;
  userId!: string;
  currentUser: any;
  userData: any;
  constructor(private profileService: ProfileService,
              private supaService: SupaService,
  ) {}

  async ngOnInit() {
    this.currentUser = await this.supaService.getCurrentUser();
   
    this.candidateData = await this.profileService.getCandidateDetails(this.currentUser.id);
    
    console.log("Data",this.candidateData);
  }

  downloadPDF() {
  const element = document.getElementById('resumeContent');

  const options = {
    
    filename: `${this.candidateData?.fullname || 'resume'}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      scrollY: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  (html2pdf as any)().set(options).from(element).save();
}

}
