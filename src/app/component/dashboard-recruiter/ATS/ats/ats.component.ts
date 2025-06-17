import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from 'src/app/services/job.service';


@Component({
  selector: 'app-ats',
  templateUrl: './ats.component.html',
  styleUrls: ['./ats.component.css']
})
export class ATSComponent implements OnInit {
  
  jobId: string | null = null;
  applications: any[] = [];
  filteredApplications: any[] = [];
  minMatchPercentage: number = 0;
  filterApplied: boolean = false;
  isProcessing: boolean = false;

  constructor(
    private router: Router,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    const state = history.state;
    this.jobId = state.jobId || null;
    this.applications = state.applications || [];

    // Sort applications by overall_match_score in descending order
    this.sortApplicationsByMatchScore();

    // Initialize filtered applications to show all applications initially
    this.filteredApplications = [...this.applications];
    
    console.log('Job ID:', this.jobId);
    console.log('Applications:', this.applications);

    // Parse resume summaries if available
    this.applications.forEach(app => {
      if (app.resume_summary) {
        try {
          const resumeSummaryObj = JSON.parse(app.resume_summary);
          app.parsedResumeSummary = resumeSummaryObj.data?.text || '';
        } catch (e) {
          console.error('Error parsing resume summary:', e);
          app.parsedResumeSummary = '';
        }
      }
    });
  }

  private sortApplicationsByMatchScore(): void {
    this.applications.sort((a, b) => {
      // Sort in descending order (highest match score first)
      return (b.overall_match_score || 0) - (a.overall_match_score || 0);
    });
  }

  filterCandidates(): void {
    this.filterApplied = true;
    this.filteredApplications = this.applications.filter(app => 
      app.overall_match_score >= this.minMatchPercentage
    );
    // Note: filteredApplications will maintain the original sort order since 
    // we're filtering from the already sorted applications array
  }

  resetFilter(): void {
    this.filterApplied = false;
    this.minMatchPercentage = 0;
    this.filteredApplications = [...this.applications];
  }

  getStatusDisplay(status: string): string {
    switch(status) {
      case 'selected':
        return 'Selected';
      case 'rejected':
        return 'Rejected';
      case 'inprocess':
      default:
        return 'In Process';
    }
  }

  async sendMailToFilteredCandidates() {
  if (this.filteredApplications.length === 0) {
    alert('No candidates to send mail to.');
    return;
  }

  this.isProcessing = true;
  
  try {
    // Step 1: Mark candidates as selected
    await this.markSelectedCandidates();

    // Step 2: Close the job
    if (this.jobId) {
      const closed = await this.jobService.updateJobStatus(this.jobId, 'closed');
      if (closed) {
        console.log('✅ Job closed successfully.');
      } else {
        console.warn(' Failed to close the job.');
      }
    }

    // Step 3: Navigate to mail composer
    const candidateIds = this.filteredApplications.map(app => app.candidate_id);
    this.router.navigate(['recruiter-dashboard/compose-mail'], {
      state: {
        candidateIds,
        jobId: this.jobId
      }
    });

  } catch (error) {
    console.error('Error processing mail sending:', error);
    alert('Error occurred while processing. Please try again.');
  } finally {
    this.isProcessing = false;
  }
}

  async markSelectedCandidates(): Promise<void> {
    if (this.filteredApplications.length === 0) {
      alert('No candidates to mark as selected.');
      return;
    }

    this.isProcessing = true;
    
    try {
      const applicationIds = this.filteredApplications.map(app => app.id);
      await this.updateApplicationsStatus(applicationIds, 'selected');
      
      // Update local data
      this.filteredApplications.forEach(app => {
        app.status = 'selected';
        // Also update in the main applications array
        const mainApp = this.applications.find(a => a.id === app.id);
        if (mainApp) {
          mainApp.status = 'selected';
        }
      });

      alert(`${this.filteredApplications.length} candidates marked as selected.`);
    } catch (error) {
      console.error('Error marking candidates as selected:', error);
      alert('Error occurred while updating status. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  async markRejectedCandidates(): Promise<void> {
    if (this.filteredApplications.length === 0) {
      alert('No candidates to mark as rejected.');
      return;
    }

    const confirmReject = confirm(`Are you sure you want to mark ${this.filteredApplications.length} candidates as rejected?`);
    if (!confirmReject) return;

    this.isProcessing = true;
    
    try {
      const applicationIds = this.filteredApplications.map(app => app.id);
      await this.updateApplicationsStatus(applicationIds, 'rejected');
      
      // Update local data
      this.filteredApplications.forEach(app => {
        app.status = 'rejected';
        // Also update in the main applications array
        const mainApp = this.applications.find(a => a.id === app.id);
        if (mainApp) {
          mainApp.status = 'rejected';
        }
      });

      alert(`${this.filteredApplications.length} candidates marked as rejected.`);
    } catch (error) {
      console.error('Error marking candidates as rejected:', error);
      alert('Error occurred while updating status. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  private async updateApplicationsStatus(applicationIds: string[], status: string): Promise<void> {
    try {
      // Use the existing supabase client from jobService
      const supabaseClient = (this.jobService as any).supabase_client;
      
      const { error } = await supabaseClient
        .from('job_applications')
        .update({ status: status })
        .in('id', applicationIds);

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Failed to update application status: ${error.message}`);
      }

      console.log(`Successfully updated ${applicationIds.length} applications to status: ${status}`);
    } catch (error) {
      console.error('Error updating applications status:', error);
      throw error;
    }
  }
}