import { Component } from '@angular/core';
import { JobService } from 'src/app/services/job.service';
import { SupaService } from 'src/app/services/supa.service';

@Component({
  selector: 'app-job-apply',
  templateUrl: './job-apply.component.html',
  styleUrls: ['./job-apply.component.css']
})
export class JobApplyComponent {
  
  jobs: any[] = [];
  showForm: boolean = false;
  selectedJob: any = null; 
  jobDescription: any;
  summary: any;
  candidateResumes: any[] = []; // Store candidate's resumes
  selectedResumeUrl: string = ''; // Track selected resume URL
  
  constructor(private jobService: JobService, private supabase: SupaService) {
    this.getJobs();
    this.loadCandidateResumes();
  }

  async loadCandidateResumes() {
    try {
      const user = await this.supabase.getCurrentUser();
      const candidateId = user?.id;
      
      if (!candidateId) {
        return;
      }

      // Get candidate data with resume URLs
      const candidateData = await this.supabase.getCandidateById(candidateId);
      
      if (candidateData && candidateData.resume_url && Array.isArray(candidateData.resume_url)) {
        // Extract filename from URL for display purposes
        this.candidateResumes = candidateData.resume_url.map((url: string, index: number) => {
          const filename = this.extractFilenameFromUrl(url);
          return {
            url: url,
            filename: filename,
            displayName: filename || `Resume ${index + 1}`
          };
        });
      }
      
      console.log("Loaded candidate resumes:", this.candidateResumes);
    } catch (error) {
      console.error("Error loading candidate resumes:", error);
    }
  }

  extractFilenameFromUrl(url: string): string {
    try {
      // Extract filename from Supabase storage URL
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      // Decode URL encoded filename
      return decodeURIComponent(filename);
    } catch (error) {
      return '';
    }
  }

  async getJobs() {
    try {
      const user = await this.supabase.getCurrentUser();
      const candidateId = user?.id;
  
      if (!candidateId) {
        alert("You must be logged in as a candidate.");
        return;
      }
      const jobs = await this.jobService.getAllJobs();
      const applications = await this.jobService.getApplicationsForCandidate(candidateId);
      console.log("Jobs", jobs);
  
      console.log("Applications fetched:", applications); 
  
      const appliedJobIds = new Set(applications.map(app => app.job_id));
  
      this.jobs = jobs.map(job => ({
        ...job,
        companyName: job.recruiter?.company_name,
        hasApplied: appliedJobIds.has(job.id)
      }));
  
      console.log("Fetched jobs with hasApplied:", this.jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }

  onResumeSelectionChange(jobId: string, resumeUrl: string, event: any) {
    // Update the selected resume URL for this job
    const job = this.jobs.find(j => j.id === jobId);
    if (job) {
      job.selectedResumeUrl = resumeUrl;
    }
    console.log("Selected resume for job", jobId, ":", resumeUrl);
  }

  async applyForJob(jobId: string, event: any) {
    event.preventDefault(); 
    const user = await this.supabase.getCurrentUser();
    const candidateId = user?.id;
  
    if (!candidateId) {
      alert("You must be logged in as a candidate to apply.");
      return;
    }
  
    console.log("Trying to apply for Job ID:", jobId);
  
    const alreadyApplied = this.jobs.find(job => job.id === jobId)?.hasApplied;
    console.log("Already applied?", alreadyApplied); 
  
    if (alreadyApplied) {
      alert("You have already applied for this job.");
      return;
    }

    let useDefaultResume = false;
    let resumeFile = null;
    let useSelectedResume = false;
    let selectedResumeUrl = '';

    if (event.target) {
      // Check if user selected an existing resume
      const resumeSelect = event.target.querySelector('select[name="resumeSelect"]');
      if (resumeSelect && resumeSelect.value && resumeSelect.value !== '') {
        useSelectedResume = true;
        selectedResumeUrl = resumeSelect.value;
      }

      // Check if user wants to use default resume (first resume in array)
      const defaultResumeCheckbox = event.target.querySelector('input[name="defaultResume"]');
      if (defaultResumeCheckbox && defaultResumeCheckbox.checked) {
        useDefaultResume = true;
      }

      // Check for new file upload
      const fileInput = event.target.querySelector('input[type="file"]');
      resumeFile = fileInput?.files?.length ? fileInput.files[0] : null;
    }

    // Validate that user has selected some form of resume
    if (!useDefaultResume && !useSelectedResume && !resumeFile) {
      alert("Please select a resume or upload a new one to apply.");
      return;
    }
  
    try {
      // Modified service call to handle selected resume
      await this.jobService.applyForJobWithSelectedResume(
        jobId, 
        candidateId, 
        useDefaultResume, 
        resumeFile,
        useSelectedResume,
        selectedResumeUrl
      );
  
      this.jobs = this.jobs.map(job =>
        job.id === jobId ? { ...job, hasApplied: true } : job
      );
  
      console.log("Application submitted successfully for:", jobId);
      alert("Application submitted successfully!");
      
      if (this.selectedJob) {
        this.closeJobDetails();
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Error applying for job: " + error);
    }
  }

  openJobDetails(job: any): void {
    this.selectedJob = job;
    document.body.style.overflow = 'hidden';
  }

  closeJobDetails(): void {
    this.selectedJob = null;
    document.body.style.overflow = 'auto';
  }
}