import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth,private router: Router,private db: AngularFireDatabase) {

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

enregistrerUtilisateurPrincipal(userId: string, data: any) {
  return this.db.database.ref('users/' + userId).set(data);
}

enregistrerPatient(userId: string, data: any) {
  return this.db.database.ref('patients/' + userId).set(data);
}

enregistrerDossierInitial(patientId: string) {
  const dossierRef = this.db.database.ref('dossier');
  const newDossierKey = dossierRef.push().key;
  const codeAcces = Math.random().toString(36).substring(2, 8).toUpperCase();

  const dossierData = {
    codeAcces: codeAcces,
    dateCreation: new Date().toISOString(),
    etat: "actif",
    numero: 1,
    patientId: patientId
  };

  if (newDossierKey) {
    return dossierRef.child(newDossierKey).set(dossierData);
  }

  return Promise.reject('Erreur : clé de dossier manquante.');
}

enregistrerMedecin(userId: string, data: any) {
  return this.db.database.ref('medecins/' + userId).set(data);
}

enregistrerAnalyste(userId: string, data: any) {
  return this.db.database.ref('analystes/' + userId).set(data);
}

enregistrerRadiologue(userId: string, data: any) {
  return this.db.database.ref('radiologues/' + userId).set(data);
}

}
