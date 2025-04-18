import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth,private router: Router) {

  }

signInWithEmailAndPassword(email: string, password: string) {
return this.afAuth.signInWithEmailAndPassword(email, password);
}

signOut() {
  return this.afAuth.signOut().then(() => {
    localStorage.clear();
    this.router.navigate(['/']); // Redirige vers la page home
  }).catch(error => console.error('Erreur de déconnexion :', error));
}

signUpWithEmailAndPassword(email: string, password: string) {
  return this.afAuth.createUserWithEmailAndPassword(email, password);
}




}
