import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardPatientComponent } from './dashboard-patient/dashboard-patient.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DossierDetailsComponent } from './dossier-details/dossier-details.component';
import { HomeComponent } from './home/home.component';
import { FichesSoinComponent } from './fiches-soin/fiches-soin.component';
import { AnalysesMedicalesComponent } from './analyses-medicales/analyses-medicales.component';
import { ImagesMedicalesComponent } from './images-medicales/images-medicales.component';
import { specialitesComponent } from './specialites/specialites.component';
import { PartenairesComponent } from './partenaires/partenaires.component';
import { ServicesComponent } from './services/services.component';


const routes: Routes = [
  {path:'home',pathMatch:'full' ,component:HomeComponent},
  {path:'',redirectTo:'home',pathMatch:'full'},
  {path:'login',component:LoginComponent},
  { path: 'register', component: RegisterComponent },
  { path: 'dashboardPatient', component: DashboardPatientComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'dossier-details/:id', component: DossierDetailsComponent },
  { path: 'home/specialites', component: specialitesComponent },
  { path: 'home/partenaires', component: PartenairesComponent },
  { path: 'home/services', component: ServicesComponent },
  { path: 'fiches-soin/:numero', component: FichesSoinComponent },
  { path: 'images-medicales/:numero', component: ImagesMedicalesComponent },
  { path: 'analyses-medicales/:numero', component: AnalysesMedicalesComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
