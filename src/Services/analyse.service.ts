// src/app/services/analyse.service.ts
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnalyseService {
  private cloudName = 'dxc5curxy';
  private uploadPreset = 'ProjectMedicale';
  constructor(private db: AngularFireDatabase) {}

  getLastAnalyseNumero(): Observable<number> {
    return this.db.list('analysesMedicales', ref =>
      ref.orderByChild('numero').limitToLast(1)
    ).snapshotChanges().pipe(
      map(changes => {
        const maxFiche = changes.map(c => ({
          id: c.payload.key,
          ...(c.payload.val() as any)
        }))[0];
        return parseInt(maxFiche?.numero ?? '0');
      })
    );
  }

  getDossierIdByPatient(patientId: string): Observable<string | null> {
    return this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(patientId))
      .snapshotChanges().pipe(
        map(dossiers => dossiers.length > 0 ? dossiers[0].key : null)
      );
  }

  addAnalyseMedicale(data: any): Promise<void> {
    return this.db.list('analysesMedicales').push(data).then(() => {});
  }

  uploadFileToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/raw/upload`;

    return fetch(url, {
      method: 'POST',
      body: formData
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Échec de l’upload');
      }
      return res.json();
    })
    .then(data => data.secure_url);
  }

  updateAnalyse(key: string, data: any): Promise<void> {
    return this.db.object(`analysesMedicales/${key}`).update(data);
  }

  getAnalyses(): Observable<any[]> {
    return this.db.list('analysesMedicales')
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({
            id: c.payload.key,
            ...(c.payload.val() as any)
          }))
        )
      );
  }

  deleteAnalyse(analyseKey: string): Promise<void> {
    return this.db.object(`analysesMedicales/${analyseKey}`).remove()
      .then(() => {
        console.log('Analyse supprimée de Firebase.');
      })
      .catch(err => {
        console.error('Erreur lors de la suppression :', err);
        throw err; // Rejeter l'erreur pour gérer les erreurs dans le composant
      });
  }
}
