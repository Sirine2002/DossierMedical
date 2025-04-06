import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AuthService } from 'src/Services/auth-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  cin: string = '';
  firstName: string = '';
  lastName: string = '';
  phone: string = '';
  email: string = '';
  password: string = '';
  selectedRole: string = 'Patient';

  // Champs supplémentaires selon le rôle
  dateNaissance?: string;
  sexe?: string;
  adresse?: string;
  specialite?: string;
  typeImagerie?: string;
  service?: string;

  constructor(
    private auth: AuthService,
    private router: Router,
    private db: AngularFireDatabase
  ) {}

  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onRoleChange(role: string) {
    this.selectedRole = role;
  }

  onSubmit(): void {
    this.auth.signUpWithEmailAndPassword(this.email, this.password)
      .then((userCredential) => {
        const userId = userCredential.user?.uid;
        if (userId) {
          let userData: any = {
            cin: this.cin,
            firstName: this.firstName,
            lastName: this.lastName,
            phone: this.phone,
            email: this.email,
            role: this.selectedRole
          };

          // Enregistrement spécifique selon le rôle
          switch (this.selectedRole) {
            case 'Patient':
              const patientData = {
                utilisateurId: userId,
                dateNaissance: this.dateNaissance,
                sexe: this.sexe,
                adresse: this.adresse
              };
              this.db.database.ref('patients').child(userId).set(patientData)
                .then(() => console.log("Utilisateur patient enregistré"))
                .catch((err) => console.error("Erreur patient :", err));
              break;

            case 'Analyste':
              const analysteData = {
                utilisateurId: userId,
                specialite: this.specialite,
                service: this.service
              };
              this.db.database.ref('analystes').child(userId).set(analysteData)
                .then(() => console.log("Utilisateur analyste enregistré"))
                .catch((err) => console.error("Erreur analyste :", err));
              break;

            case 'Medecin':
              const medecinData = {
                utilisateurId: userId,
                specialite: this.specialite
              };
              this.db.database.ref('medecins').child(userId).set(medecinData)
                .then(() => console.log("Utilisateur médecin enregistré"))
                .catch((err) => console.error("Erreur médecin :", err));
              break;

            case 'Radiologue':
              const radiologueData = {
                utilisateurId: userId,
                typeImagerie: this.typeImagerie,
                service: this.service
              };
              this.db.database.ref('radiologues').child(userId).set(radiologueData)
                .then(() => console.log("Utilisateur radiologue enregistré"))
                .catch((err) => console.error("Erreur radiologue :", err));
              break;
          }

          // Enregistrement général
          this.db.database.ref('users/' + userId).set(userData)
            .then(() => {
              console.log("Utilisateur principal enregistré");
              this.router.navigate(['/login']);
            })
            .catch((error) => {
              console.error("Erreur user principal :", error);
            });
        }
      })
      .catch((error) => {
        console.error("Erreur d'inscription :", error);
      });
  }
}
