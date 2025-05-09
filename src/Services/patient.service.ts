import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Interfaces optionnelles à adapter selon ta structure réelle
export interface Dossier {
  key: string;
  [key: string]: any;
}

export interface FicheSoin {
  id: string;
  [key: string]: any;
}

export interface ImageMedicale {
  key: string;
  type: string;
  [key: string]: any;
}

export interface AnalyseMedicale {
  key: string;
  type: string;
  [key: string]: any;
}

export interface PatientData {
  id: string;
  fullName: string;
  cin: string;
  dateNaissance: string;
  phone: string;
  email: string;
  sexe: string;
  adresse: string;
  dateCreation: string;
  numero: number;
}


@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private db: AngularFireDatabase) {}

  // 🔹 Récupérer les dossiers d’un patient
  getDossiersByPatientId(patientId: string): Observable<Dossier[]> {
    return this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(patientId))
      .snapshotChanges()
      .pipe(
        map(dossiers => dossiers.map(d => ({ key: d.key!, ...(d.payload.val() as object) })))
      );
  }

  // 🔹 Récupérer les fiches de soin pour un dossier
  getFichesSoinByDossierId(dossierId: string): Observable<FicheSoin[]> {
    return this.db.list('fichesSoin', ref => ref.orderByChild('dossierId').equalTo(dossierId))
      .snapshotChanges()
      .pipe(
        map(fiches => fiches.map(fiche => ({ id: fiche.key!, ...(fiche.payload.val() as object) })))
      );
  }

  // 🔹 Récupérer les images médicales pour un dossier
  getImagesMedicalesByDossierId(dossierId: string): Observable<ImageMedicale[]> {
    return this.db.list('imagesMedicales', ref => ref.orderByChild('dossierId').equalTo(dossierId))
      .snapshotChanges()
      .pipe(
        map(images => images.map(image => ({
          key: image.key!,
          type: 'image',
          ...(image.payload.val() as object)
        })))
      );
  }

  // 🔹 Récupérer les analyses médicales pour un dossier
  getAnalysesMedicalesByDossierId(dossierId: string): Observable<AnalyseMedicale[]> {
    return this.db.list('analysesMedicales', ref => ref.orderByChild('dossierId').equalTo(dossierId))
      .snapshotChanges()
      .pipe(
        map(analyses => analyses.map(analysis => ({
          key: analysis.key!,
          type: 'analyse',
          ...(analysis.payload.val() as object)
        })))
      );
  }

  getAllPatients(): Observable<any[]> {
    return this.db.list('users').snapshotChanges();
  }

  // Récupérer les informations supplémentaires sur le patient
  getPatientInfo(userId: string): Observable<any[]> {
    return this.db.list('patients', (ref) =>
      ref.orderByChild('utilisateurId').equalTo(userId)
    ).valueChanges();
  }

  // Récupérer les dossiers associés à un patient
  getPatientDossiers(userId: string): Observable<any[]> {
    return this.db.list('dossier', (ref) =>
      ref.orderByChild('patientId').equalTo(userId)
    ).valueChanges();
  }

  

  
  



  
}
