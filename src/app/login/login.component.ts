import { Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuthService } from 'src/Services/auth-service.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private auth: AuthService, private router: Router, private db: AngularFireDatabase) {}

  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit(): void {
    this.auth.signInWithEmailAndPassword(this.email, this.password)
      .then((userCredential) => {
        const userId = userCredential.user?.uid;

        if (userId) {
          this.db.database.ref('users/' + userId).once('value')
            .then((snapshot) => {
              if (snapshot.exists()) {
                const userData = snapshot.val();
                const role = userData.role;
                const username = userData.firstName + ' ' + userData.lastName;
                const lignesFicheSoin = userData.lignesFicheSoin || [];

                console.log("Connexion réussie, rôle :", role);
                localStorage.setItem('userRole', role);
                localStorage.setItem('username', username);
                localStorage.setItem('userData', JSON.stringify(userData));
                
                

                // 🔁 Fonction utilitaire pour charger des données supplémentaires
                const loadAdditionalData = (collection: string, storageKey: string, redirectPath: string) => {
                  this.db.database.ref(collection)
                    .orderByChild('utilisateurId')
                    .equalTo(userId)
                    .once('value')
                    .then((snapshot) => {
                      if (snapshot.exists()) {
                        const dataObj = snapshot.val();
                        const key = Object.keys(dataObj)[0];
                        const extraData = dataObj[key];
                        const fullUserData = {
                          ...userData,
                          ...extraData,
                        };
                        console.log(`Données supplémentaires ${collection}:`, fullUserData);
                        localStorage.setItem(storageKey, JSON.stringify(fullUserData));
                      } else {
                        console.log(`Aucune donnée trouvée pour ${collection}`);
                      }
                      this.router.navigate([redirectPath]);
                    })
                    .catch((error) => {
                      console.error(`Erreur lors de la récupération des données de ${collection} :`, error);
                      this.router.navigate([redirectPath]);
                    });
                };
                

                // 📦 Redirection et récupération en fonction du rôle
                switch (role) {
                  case 'Patient':
                    loadAdditionalData('patients', 'patientData', '/dashboardPatient');
                    break;
                  case 'Medecin':
                    loadAdditionalData('medecins', 'medecinData', '/dashboard');
                    break;
                  case 'Analyste':
                    loadAdditionalData('analystes', 'analysteData', '/dashboard');
                    break;
                  case 'Radiologue':
                    loadAdditionalData('radiologues', 'radiologueData', '/dashboard');
                    break;
                  default:
                    this.router.navigate(['/']);
                }

              } else {
                console.error("Aucune donnée utilisateur trouvée.");
                this.router.navigate(['/']);
              }
            })
            .catch((error) => {
              console.error("Erreur lors de la récupération des données utilisateur :", error);
            });
        }
      })
      .catch((error) => {
        console.error("Erreur de connexion :", error);
      });
  }
}
