import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardPatientComponent } from './dashboard-patient/dashboard-patient.component';
import { ProfileComponent } from './profile/profile.component';
import { PatientDetailsPageComponent } from './patient-details-page/patient-details-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DossierDetailsComponent } from './dossier-details/dossier-details.component';

const routes: Routes = [
  {path:'login',pathMatch:'full' ,component:LoginComponent},
  {path:'',redirectTo:'login',pathMatch:'full'},
  { path: 'register', component: RegisterComponent },
  { path: 'dashboardPatient', component: DashboardPatientComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'patient-details', component: PatientDetailsPageComponent },
  { path: 'dossiers/:id', component: DossierDetailsComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
