// image.service.ts
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private cloudName = 'dxc5curxy';
  private uploadPreset = 'ProjectMedicale';

  constructor(private db: AngularFireDatabase) {}

  // Méthode pour uploader l'image sur Cloudinary
  uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    return fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => data.secure_url)
      .catch((err) => {
        console.error('Erreur lors du téléchargement de l\'image:', err);
        throw err;
      });
  }

  // Méthode pour ajouter une image médicale dans Firebase
  addImage(imageData: any): Promise<void> {
    return this.db.list('imagesMedicales').push(imageData).then(() => {});
  }

  // Méthode pour récupérer les dossiers d'un patient
  getPatientDossiers(patientId: string): Observable<any[]> {
    return this.db.list('dossier', (ref) => ref.orderByChild('patientId').equalTo(patientId)).snapshotChanges();
  }

  updateImage(imageKey: string, imageData: any): Promise<void> {
    return this.db.object(`imagesMedicales/${imageKey}`).update(imageData);
  }

  getAllImages(): Observable<any[]> {
    return this.db.list('imagesMedicales').snapshotChanges().pipe(
      map(images => images.map(i => {
        const data = i.payload.val() as any;
        const id = i.key;
        return { id, ...data };
      }))
    );
  }

  deleteImage(imageKey: string): Promise<void> {
    return this.db.object(`imagesMedicales/${imageKey}`).remove()
      .then(() => {
        console.log('Image supprimée de Firebase.');
      })
      .catch(err => {
        console.error('Erreur lors de la suppression de l\'image :', err);
        throw err; // Rejeter l'erreur pour gestion ultérieure dans le composant
      });
  }

  loadImagesByDossierId(dossierId: string): Observable<any[]> {
    return this.db.list('imagesMedicales', ref =>
      ref.orderByChild('dossierId').equalTo(dossierId)
    ).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({
          id: c.payload.key,
          ...(c.payload.val() as any)
        }))
      )
    );
  }
}
