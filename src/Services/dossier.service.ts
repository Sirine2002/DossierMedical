// import { Injectable } from '@angular/core';
// import { AngularFireDatabase } from '@angular/fire/compat/database';
// import { map, take } from 'rxjs/operators';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class DossierService {

//   constructor(private db: AngularFireDatabase) {}

//   getUsers(): Observable<any[]> {
//     return this.db.list('users').snapshotChanges().pipe(
//       map(users => users.map(user => ({
//         key: user.key,
//         ...(user.payload.val() as any)
//       })))
//     );
//   }

//   getPatientsByUserId(userId: string): Observable<any[]> {
//     return this.db.list('patients', ref => ref.orderByChild('utilisateurId').equalTo(userId))
//       .valueChanges();
//   }

//   getDossiersByPatientId(patientId: string): Observable<any[]> {
//     return this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(patientId))
//       .valueChanges();
//   }

//   getFichesSoinByDossierId(dossierId: string): Observable<any[]> {
//     return this.db.list('fichesSoin', ref => ref.orderByChild('dossierId').equalTo(dossierId))
//       .snapshotChanges().pipe(
//         map(fiches => fiches.map(fiche => ({
//           key: fiche.key,
//           ...(fiche.payload.val() as any)
//         })))
//       );
//   }

//   getImagesByDossierId(dossierId: string): Observable<any[]> {
//     return this.db.list('imagesMedicales', ref => ref.orderByChild('dossierId').equalTo(dossierId))
//       .snapshotChanges().pipe(
//         map(images => images.map(image => ({
//           key: image.key,
//           ...(image.payload.val() as any)
//         })))
//       );
//   }

//   getAnalysesByDossierId(dossierId: string): Observable<any[]> {
//     return this.db.list('analysesMedicales', ref => ref.orderByChild('dossierId').equalTo(dossierId))
//       .snapshotChanges().pipe(
//         map(analyses => analyses.map(analyse => ({
//           key: analyse.key,
//           ...(analyse.payload.val() as any)
//         })))
//       );
//   }

//   getLignesFicheSoinByFicheId(ficheId: string): Observable<any[]> {
//     return this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(ficheId))
//       .valueChanges();
//   }

//   deleteLigneFicheSoin(ligneKey: string): Promise<void> {
//     return this.db.object(`lignesFicheSoin/${ligneKey}`).remove();
//   }

//   deleteFicheSoin(ficheKey: string): Promise<void> {
//     return this.db.object(`fichesSoin/${ficheKey}`).remove();
//   }

//   getAllLignesFicheSoin(): Observable<any[]> {
//     return this.db.list('lignesFicheSoin').snapshotChanges().pipe(
//       map(lignes => lignes.map(ligne => ({
//         key: ligne.key,
//         ...(ligne.payload.val() as any)
//       })))
//     );
//   }

// }

import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { combineLatest, map, Observable, of, switchMap, take } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class DossierService {
  constructor(private db: AngularFireDatabase) {}

  // Récupérer tous les utilisateurs de type 'Patient'
  getAllUsers(): Observable<any[]> {
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

  // Récupérer les informations d'un patient, y compris les dossiers
  getPatientData(userId: string): Observable<any> {
    return new Observable(observer => {
      this.getPatientInfo(userId).subscribe(patientInfos => {
        if (patientInfos.length > 0) {
          const patientInfo = patientInfos[0];
          this.getPatientDossiers(userId).subscribe(dossiers => {
            if (dossiers.length > 0) {
              const dossier = dossiers[0];
              const patientData = {
                ...patientInfo,
                ...dossier,
              };
              observer.next(patientData);
            } else {
              observer.error('Dossier introuvable');
            }
          });
        } else {
          observer.error('Patient introuvable');
        }
      });
    });
  }
 
  
}
