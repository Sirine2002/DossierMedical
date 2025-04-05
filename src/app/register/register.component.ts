import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database'; // Pour sauvegarder les données utilisateurs dans la base de données
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

  constructor(private auth: AuthService, private router: Router, private db: AngularFireDatabase) {}

  hide = signal(true);
  
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  // Fonction appelée quand le rôle change
  onRoleChange(role: string) {
    this.selectedRole = role;
  }

  onSubmit(): void {
    this.auth.signUpWithEmailAndPassword(this.email, this.password)
      .then((userCredential) => {
        const userId = userCredential.user?.uid; // Récupérer l'UID de l'utilisateur
        if (userId) {
          let userData: any = {
            cin: this.cin,
            firstName: this.firstName,
            lastName: this.lastName,
            phone: this.phone,
            email: this.email,
            role: this.selectedRole
          };

          // Ajouter les champs spécifiques au rôle
          if (this.selectedRole === 'Patient') {
            let userDataPatient: any = {
            utilisateurId: userId,
            dateNaissance :this.dateNaissance,
            sexe: this.sexe,
            adresse: this.adresse
            }
            this.db.database.ref('patients/').set(userDataPatient).then(() => {
              console.log("Utilisateur patient enregistré avec succès");
            }).catch((error) => {
              console.error("Erreur lors de l'enregistrement des données utilisateur patient : ", error);
            });

          } else if (this.selectedRole === 'Analyste') {
            let userDataAnalyste: any = {
              utilisateurId: userId,
              typeImagerie: this.typeImagerie,
              service: this.service
            }
            this.db.database.ref('analystes/').set(userDataAnalyste).then(() => {
              console.log("Utilisateur analyste enregistré avec succès");
            }).catch((error) => {
              console.error("Erreur lors de l'enregistrement des données utilisateur analyste : ", error);
            });
          } else if (this.selectedRole === 'Medecin') {
            let userDataMedecin: any = {
              utilisateurId: userId,
              specialite: this.specialite
            }
            this.db.database.ref('medecins/').set(userDataMedecin).then(() => {
              console.log("Utilisateur medecin enregistré avec succès");
            }).catch((error) => {
              console.error("Erreur lors de l'enregistrement des données utilisateur medecin : ", error);
            });
          } else if (this.selectedRole === 'Radiologue') {
            let userDataRadiologue: any = {
              utilisateurId: userId,
              typeImagerie: this.typeImagerie,
              service: this.service
            }
            this.db.database.ref('radiologues/').set(userDataRadiologue).then(() => {
              console.log("Utilisateur radiologue enregistré avec succès");
            }).catch((error) => {
              console.error("Erreur lors de l'enregistrement des données utilisateur radiologue : ", error);
            });
          }

          // Enregistrer les informations supplémentaires dans Firebase Realtime Database
          this.db.database.ref('users/' + userId).set(userData)
            .then(() => {
              console.log("Utilisateur enregistré avec succès");
              this.router.navigate(['/login']);
            })
            .catch((error) => {
              console.error("Erreur lors de l'enregistrement des données utilisateur : ", error);
            });
        }
      })
      .catch((error) => {
        console.error("Erreur d'inscription : ", error);
      });
  }
}
