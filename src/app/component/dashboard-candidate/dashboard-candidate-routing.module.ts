import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileCandidateComponent } from './profile-candidate/profile-candidate/profile-candidate.component';
import { DashboardCandidateComponent } from './dashboard-candidate.component';
import { JobApplyComponent } from './job-apply/job-apply/job-apply.component';
import { CompanyListComponent } from './company-list/company-list.component';
import { HomeComponent } from './home/home.component';

// const routes: Routes = [
//   { path: '', component: DashboardCandidateComponent, children: [  
//     {path: '', component: HomeComponent},
//     { path: 'profile', component: ProfileCandidateComponent },
//     { path: 'job', component: JobApplyComponent },
//     { path: 'company', component: CompanyListComponent }
//   ]},
//   { path: 'profile', component: ProfileCandidateComponent },
//   { path: 'job', component: JobApplyComponent }
// ];

const routes: Routes = [
  { 
    path: '', 
    component: DashboardCandidateComponent, 
    children: [  
      { path: '', component: HomeComponent },
      { path: 'profile', component: ProfileCandidateComponent },
      { path: 'job', component: JobApplyComponent },
      { path: 'company', component: CompanyListComponent }
    ] 
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardCandidateRoutingModule {}