import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardPatientComponent } from './dashboard-patient/dashboard-patient.component';
import { DashboardMedecinComponent } from './dashboard-medecin/dashboard-medecin.component';
import { DashboardAnalysteComponent } from './dashboard-analyste/dashboard-analyste.component';
import { DashboardRadiologueComponent } from './dashboard-radiologue/dashboard-radiologue.component';

const routes: Routes = [
  {path:'login',pathMatch:'full' ,component:LoginComponent},
  {path:'',redirectTo:'login',pathMatch:'full'},
  { path: 'register', component: RegisterComponent },
  { path: 'dashboardPatient', component: DashboardPatientComponent },
  { path: 'dashboardMedecin', component: DashboardMedecinComponent },
  { path: 'dashboardAnalyste', component: DashboardAnalysteComponent },
  { path: 'dashboardRadiologue', component: DashboardRadiologueComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
