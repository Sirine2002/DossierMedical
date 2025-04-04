import { Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuthService } from 'src/Services/auth-service.service';
import { AngularFireDatabase } from '@angular/fire/compat/database'; // Import Firebase Database

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
        const userId = userCredential.user?.uid; // Récupération de l'UID

        if (userId) {
          // Récupérer les informations de l'utilisateur depuis Firebase Realtime Database
          this.db.database.ref('users/' + userId).once('value')
            .then((snapshot) => {
              if (snapshot.exists()) {
                const userData = snapshot.val();
                const role = userData.role;
                const username = userData.firstName + ' ' + userData.lastName;


                console.log("Connexion réussie, rôle :", role);
                localStorage.setItem('userRole', role);
                localStorage.setItem('username', username);

                // Redirection en fonction du rôle
                if (role === 'Medecin') {
                  this.router.navigate(['/dashboardMedecin']);
                } else if (role === 'Patient') {
                  this.router.navigate(['/dashboardPatient']);
                } else if (role === 'Analyste') {
                  this.router.navigate(['/dashboardAnalyste']);
                }else if (role === 'Radiologue') {
                  this.router.navigate(['/dashboardRadiologue']);
                }else {
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