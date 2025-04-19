import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from './environment';
import { LoginComponent } from './login/login.component';
import {MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatSortModule} from '@angular/material/sort';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RegisterComponent } from './register/register.component';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { DashboardPatientComponent } from './dashboard-patient/dashboard-patient.component';
import { NavbarComponent } from './navbar/navbar.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProfileComponent } from './profile/profile.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FicheSoinDetailsComponent } from './fiche-soin-details/fiche-soin-details.component';
import { VoirPlusComponent } from './voir-plus/voir-plus.component';
import { MatRadioModule } from '@angular/material/radio';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DossierDetailsComponent } from './dossier-details/dossier-details.component';
import { FooterHomeComponent } from './footer-home/footer-home.component';
import { HomeComponent } from './home/home.component';
import { NavBarHomeComponent } from './nav-bar-home/nav-bar-home.component';
import { MatDividerModule } from '@angular/material/divider';
import { FichesSoinComponent } from './fiches-soin/fiches-soin.component';
import { AnalysesMedicalesComponent } from './analyses-medicales/analyses-medicales.component';
import { ImagesMedicalesComponent } from './images-medicales/images-medicales.component';
import { PartenairesComponent } from './partenaires/partenaires.component';
import { ServicesComponent } from './services/services.component';
import { specialitesComponent } from './specialites/specialites.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardPatientComponent,
    NavbarComponent,
    ProfileComponent,
    FicheSoinDetailsComponent,
    VoirPlusComponent,
    DashboardComponent,
    DossierDetailsComponent,
    FooterHomeComponent,
    HomeComponent,
    NavBarHomeComponent,
    FichesSoinComponent,
    AnalysesMedicalesComponent,
    ImagesMedicalesComponent,
    PartenairesComponent,
    ServicesComponent,
    specialitesComponent,

  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatIconModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatSelectModule,
    MatExpansionModule,
    MatTabsModule,
    MatGridListModule,
    MatTooltipModule,
    MatRadioModule,
    MatDividerModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }