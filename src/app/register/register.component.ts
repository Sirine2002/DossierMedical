import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database'; // Pour sauvegarder les données utilisateurs dans la base de données
import { AuthService } from 'src/Services/auth-service.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstName: string = '';
  lastName: string = '';
  phone: string = '';
  email: string = '';
  password: string = '';
  role: string = 'patient';

  constructor(private auth: AuthService, private router: Router, private db: AngularFireDatabase) {}


  onSubmit(): void {
    this.auth.signUpWithEmailAndPassword(this.email, this.password).then((userCredential) => {
      const userId = userCredential.user?.uid;  // Récupérer l'UID de l'utilisateur
      if (userId) {
        // Enregistrer les informations supplémentaires dans Realtime Database
        this.db.database.ref('users/' + userId).set({
          firstName: this.firstName,
          lastName: this.lastName,
          phone: this.phone,
          email: this.email,
          role: this.role
        }).then(() => {
          console.log("Utilisateur enregistré avec succès");
          this.router.navigate(['/login']);
        }).catch((error) => {
          console.error("Erreur lors de l'enregistrement des données utilisateur : ", error);
        });
      }
    }).catch((error) => {
      console.error("Erreur d'inscription : ", error);
    });
  }

}
