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
    private db: AngularFireDatabase,
    private AuthService: AuthService
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
        if (!userId) return;
  
        const userData: any = {
          cin: this.cin,
          firstName: this.firstName,
          lastName: this.lastName,
          phone: this.phone,
          email: this.email,
          role: this.selectedRole
        };
  
        const promises = [];
  
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

              // Récupérer le dernier numéro de dossier et incrémenter
              const dossierRef = this.db.database.ref('dossier');
              dossierRef
                .orderByChild('numero')
                .limitToLast(1)
                .once('value')
                .then(snapshot => {
                  let lastNumero = 0;
                  snapshot.forEach(childSnapshot => {
                    const data = childSnapshot.val();
                    if (data.numero) {
                      lastNumero = data.numero;
                    }
                  });

                  const nextNumero = lastNumero + 1;
                  const newDossierKey = dossierRef.push().key;
                  const codeAcces = Math.random().toString(36).substring(2, 8).toUpperCase();

                  const dossierData = {
                    codeAcces: codeAcces,
                    dateCreation: new Date().toISOString(),
                    etat: "actif",
                    numero: nextNumero,
                    patientId: userId
                  };

                  if (newDossierKey) {
                    dossierRef.child(newDossierKey).set(dossierData)
                      .then(() => console.log("Dossier initial créé avec numero", nextNumero))
                      .catch((err) => console.error("Erreur lors de la création du dossier :", err));
                  }
                })
                .catch(err => {
                  console.error("Erreur lors de la récupération du dernier numero :", err);
                });

              break;
  
          case 'Analyste':
            promises.push(this.AuthService.enregistrerAnalyste(userId, {
              utilisateurId: userId,
              specialite: this.specialite,
              service: this.service
            }));
            break;
  
          case 'Medecin':
            promises.push(this.AuthService.enregistrerMedecin(userId, {
              utilisateurId: userId,
              specialite: this.specialite
            }));
            break;
  
          case 'Radiologue':
            promises.push(this.AuthService.enregistrerRadiologue(userId, {
              utilisateurId: userId,
              typeImagerie: this.typeImagerie,
              service: this.service
            }));
            break;
        }
  
        promises.push(this.AuthService.enregistrerUtilisateurPrincipal(userId, userData));
  
        Promise.all(promises)
          .then(() => {
            console.log("Utilisateur enregistré avec succès");
            this.router.navigate(['/login']);
          })
          .catch(err => {
            console.error("Erreur lors de l'enregistrement :", err);
          });
      })
      .catch(error => {
        console.error("Erreur d'inscription :", error);
      });
  }
  
}
