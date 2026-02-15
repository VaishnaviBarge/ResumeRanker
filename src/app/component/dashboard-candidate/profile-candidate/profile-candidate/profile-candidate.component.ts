import { Component } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
import { SupaService } from 'src/app/services/supa.service';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-profile-candidate',
  templateUrl: './profile-candidate.component.html',
  styleUrls: ['./profile-candidate.component.css']
})

export class ProfileCandidateComponent {
  currentUser: any;
  userData: any;
  isEditing = false;
  updatedUserData: any = {}; 
  selectedFiles: File[] = [];
  uploading: boolean = false;
  newSkill: string = '';
  filteredSkills: string[] = [];
  showSuggestions: boolean = false;
  educationList: any[] = [];
  experienceList: any[] = [];

  showEducationModal = false;
  showExperienceModal = false;

  editingEducation: any = null;
  editingExperience: any = null;

  allSkills: string[] = [
    "Java", "Python", "C++", "JavaScript", "TypeScript", "Node.js", "Angular", "React", "Vue.js", "Spring Boot", "Django", "Flask", "Express.js",
    "MongoDB", "MySQL", "PostgreSQL", "Oracle", "Firebase", "Supabase", "REST APIs", "GraphQL", "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud",
    "Linux", "Git", "CI/CD", "Jenkins", "Terraform", "HTML", "CSS", "Tailwind", "Bootstrap", "Figma", "Adobe XD", "Photoshop", "Illustrator", 
    "UI/UX Design", "Responsive Design", "Wireframing", "Agile", "Scrum", "Kanban", "JIRA", "Trello", "Notion", "Project Management", "Team Leadership",
    "Communication", "Problem Solving", "Time Management", "Critical Thinking", "Public Speaking", "Customer Service", "Sales", "CRM", 
    "SEO", "SEM", "Digital Marketing", "Content Writing", "Copywriting", "Email Marketing", "Social Media Marketing", "Google Analytics", "Meta Ads", "Branding",
    "Excel", "PowerPoint", "Microsoft Word", "Tableau", "Power BI", "Looker", "Data Analysis", "Data Visualization", "Data Cleaning", 
    "Statistics", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "OpenCV", "NLP", "Computer Vision", "Big Data", "Spark", "Hadoop", 
    "Finance", "Accounting", "Budgeting", "Bookkeeping", "Taxation", "Auditing", "Financial Modeling", "Investment Analysis", "Risk Management",
    "Recruitment", "Onboarding", "HR Policies", "Payroll", "Performance Management", "Employee Engagement", 
    "Legal Compliance", "Contracts", "Business Development", "Market Research", "Operations Management", "Supply Chain", "Logistics", 
    "Customer Relationship Management", "Problem Resolution", "Negotiation", "Strategic Thinking", "Data Entry", "Technical Writing", 
    "Quality Assurance", "Testing", "Manual Testing", "Automation Testing", "Selenium", "Cypress", "Postman", 
    "Cloud Computing", "Networking", "Cybersecurity", "Penetration Testing", "Ethical Hacking", "DevOps", "System Administration",
    "Photography", "Video Editing", "After Effects", "Premiere Pro", "3D Modeling", "Blender", "Unity", "Unreal Engine", 
    "Teaching", "Mentoring", "Coaching", "Instructional Design", "Curriculum Development", "Research", "Scientific Writing", 
    "Foreign Languages", "Translation", "Transcription", "Voiceover", "Data Labeling", "Virtual Assistance"
  ];
  
  constructor(
    private supaService: SupaService,
    private profileService: ProfileService,
    private toastService: ToastService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadCandidateDetails();
  }

  async loadCandidateDetails() {
    this.currentUser = await this.supaService.getCurrentUser();
    if (this.currentUser) {
      this.userData = await this.profileService.getCandidateDetails(this.currentUser.id);
      console.log("Raw Data from Supabase:", this.userData);
  
      if (!this.userData || Object.keys(this.userData).length === 0) {
        console.error("Error: No user data found or empty object.");
        return;
      }
  
      this.updatedUserData = { ...this.userData }; 
      if (!Array.isArray(this.updatedUserData.skills)) {
        this.updatedUserData.skills = [];
      }
      console.log("Copied Data for Editing:", this.updatedUserData);
    }
    this.educationList = await this.profileService.getEducation(this.currentUser.id);
    this.experienceList = await this.profileService.getExperience(this.currentUser.id);

  }

openEducationModal(edu: any = null) {
  this.editingEducation = edu
    ? { ...edu }
    : {
        degree: '',
        institute: '',
        start_year: '',
        end_year: ''
      };
  this.showEducationModal = true;
}

openExperienceModal(exp: any = null){
  this.editingExperience = exp 
    ? { ...exp}
    :{
      company: '',
      role: '',
      description: '',
      location: '',
      start_date: '',
      end_date: ''
    };
  this.showExperienceModal = true;
}

closeEducationModal() {
  this.showEducationModal = false;
  this.editingEducation = null;
}

closeExperienceModal() {
  this.showExperienceModal = false;
  this.editingExperience = null;
}

async saveEducation() {
  this.editingEducation.candidate_id = this.currentUser.id;

  if (this.editingEducation.id) {
    await this.profileService.updateEducation(
      this.editingEducation.id,
      this.editingEducation
    );
  } else {
    await this.profileService.addEducation(this.editingEducation);
  }

  this.educationList = await this.profileService.getEducation(this.currentUser.id);
  this.closeEducationModal();
}

async saveExperience() {
  this.editingExperience.candidate_id = this.currentUser.id;

  if (this.editingExperience.id) {
    await this.profileService.updateExperience(
      this.editingExperience.id,
      this.editingExperience
    );
  } else {
    await this.profileService.addExperience(this.editingExperience);
  }

  this.experienceList = await this.profileService.getExperience(this.currentUser.id);
  this.closeExperienceModal();
}

async deleteEducation(id: string) {
  await this.profileService.deleteEducation(id);
  this.educationList = await this.profileService.getEducation(this.currentUser.id);
}

async deleteExperience(id: string) {
  await this.profileService.deleteExperience(id);
  this.experienceList = await this.profileService.getExperience(this.currentUser.id);
}


  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.updatedUserData = { ...this.userData }; 
      this.clearSuggestions();
    }
  }

  onFilesSelected(event: any) {
  const files = Array.from(event.target.files) as File[];
  const validFiles = files.filter(file => file.type === 'application/pdf');

  if (validFiles.length !== files.length) {
    alert("Only PDF files are allowed.");
  }

  this.selectedFiles = validFiles;
  }


  async uploadResumes() {
  if (!this.currentUser || this.selectedFiles.length === 0) return;

  for (const file of this.selectedFiles) {
    const url = await this.profileService.uploadFile(this.currentUser.id, file);

    if (url) {
      if (!this.updatedUserData.resume_url) {
        this.updatedUserData.resume_url = [];
      }

      this.updatedUserData.resume_url.push(url);
      this.toastService.show(`Uploaded: ${file.name}`);
    } else {
      this.toastService.show(`Failed to upload: ${file.name}`);
    }
  }

  this.selectedFiles = [];
  }


  async deleteResume(url: string) {
    if (!this.currentUser) return;

    const success = await this.profileService.deleteResume(this.currentUser.id, url);
    if (success) {
      this.updatedUserData.resume_url = this.updatedUserData.resume_url.filter((u: string) => u !== url);
      this.toastService.show('Resume deleted successfully!');
    } else {
      this.toastService.show('Failed to delete resume.');
    }
  }

  
  getResumeUrls(): string[] {
  return this.updatedUserData?.resume_url || [];
  }

  
  async saveChanges() {
    if (!this.currentUser || !this.updatedUserData) return;
  
    if (this.selectedFiles) {
      await this.uploadResumes(); 
    }

    console.log("Updating candidate details:", this.updatedUserData);
  
    const updatedUser = await this.profileService.updateCandidateDetails(this.currentUser.id, this.updatedUserData);
  
    if (updatedUser) {
      console.log("Profile updated successfully!", updatedUser);
      this.userData = { ...updatedUser };
      this.isEditing = false;
      this.selectedFiles = []; 
      this.clearSuggestions();
      this.toastService.show('Profile updated successfully!');
    } else {
      console.error("Failed to update candidate details");
    }
  }

  filterSkills() {
    const query = this.newSkill?.trim().toLowerCase() || '';
    
    if (query.length === 0) {
      this.clearSuggestions();
      return;
    }

    if (!this.updatedUserData.skills) {
      this.updatedUserData.skills = [];
    }

   
    this.filteredSkills = this.allSkills
      .filter(skill =>
        skill.toLowerCase().includes(query) &&
        !this.updatedUserData.skills.includes(skill)
      )
      .slice(0, 10); 
    
    this.showSuggestions = this.filteredSkills.length > 0;
    console.log('Query:', query, 'Filtered skills:', this.filteredSkills, 'Show suggestions:', this.showSuggestions);
  }

  clearSuggestions() {
    this.filteredSkills = [];
    this.showSuggestions = false;
  }

  onInputFocus() {
    
    if (this.newSkill?.trim().length > 0) {
      this.filterSkills();
    }
  }

  
  onInputBlur() {
    
    setTimeout(() => {
      this.clearSuggestions();
    }, 200);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.clearSuggestions();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.filteredSkills.length > 0) {
       
        this.selectSuggestion(this.filteredSkills[0]);
      } else {
       
        this.addSkill();
      }
    } else if (event.key === 'Tab' && this.filteredSkills.length > 0) {
      event.preventDefault();
      this.selectSuggestion(this.filteredSkills[0]);
    }
  }

  addSkill() {
    const skill = this.newSkill?.trim();
    if (skill && skill.length > 0) {
      
      if (!this.updatedUserData.skills) {
        this.updatedUserData.skills = [];
      }
      
      const skillExists = this.updatedUserData.skills.some(
        (existingSkill: string) => existingSkill.toLowerCase() === skill.toLowerCase()
      );
      
      if (!skillExists) {
        this.updatedUserData.skills.push(skill);
      }
    }
    this.clearInput();
  }

  
  selectSuggestion(skill: string) {
   
    if (!this.updatedUserData.skills) {
      this.updatedUserData.skills = [];
    }
    
    if (!this.updatedUserData.skills.includes(skill)) {
      this.updatedUserData.skills.push(skill);
    }
    this.clearInput();
  }

  removeSkill(skill: string) {
    if (this.updatedUserData.skills) {
      this.updatedUserData.skills = this.updatedUserData.skills.filter((s: string) => s !== skill);
    }
  }

 
  clearInput() {
    this.newSkill = '';
    this.clearSuggestions();
  }

  trackBySkill(index: number, skill: string): string {
    return skill;
  }

  trackByUrl(index: number, url: string): string {
  return url;
}

generateResume() {
  this.router.navigate(['/candidate-dashboard/resume-template']);
}

}