import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { firstValueFrom, map, Observable, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FicheService {

  private ficheId: string = ''; // Ajout pour stockage temporaire de l'ID de fiche

  constructor(private db: AngularFireDatabase) {}

  // Stockage temporaire d'un ID de fiche (utile pour la navigation entre composants)
  setFicheId(id: string): void {
    this.ficheId = id;
  }

  getFicheId(): string {
    return this.ficheId;
  }

  // Récupérer le dernier numéro de fiche
  async getDernierNumeroFiche(): Promise<number> {
    const snapshot = await firstValueFrom(
      this.db.list('fichesSoin', ref => ref.orderByChild('numero').limitToLast(1)).snapshotChanges()
    );
    const maxFiche = snapshot.map(c => c.payload.val() as any)[0];
    return maxFiche?.numero ? parseInt(maxFiche.numero) + 1 : 1;
  }

  // Récupérer l'ID du dossier à partir de l'ID du patient
  async getDossierIdByPatient(patientId: string): Promise<string | null> {
    const snapshot = await firstValueFrom(
      this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(patientId)).snapshotChanges()
    );
    return snapshot.length ? snapshot[0].key! : null;
  }

  // Ajouter une fiche et ses lignes
  async ajouterFicheEtLignes(ficheData: any, lignes: any[]): Promise<void> {
    const ficheRef = await this.db.list('fichesSoin').push(ficheData);
    const ficheSoinId = ficheRef.key;

    for (const ligne of lignes) {
      await this.db.list('lignesFicheSoin').push({
        ...ligne,
        ficheSoinId
      });
    }
  }

  // Récupérer une fiche spécifique par ID
  getFicheById(ficheId: string): Observable<any> {
    return this.db.object(`fichesSoin/${ficheId}`).valueChanges();
  }

  // Récupérer les lignes d'une fiche spécifique
  getLignesByFicheId(ficheId: string): Observable<any[]> {
    return this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(ficheId)).snapshotChanges();
  }

  // Récupérer les fiches avec leurs lignes pour un patient
  async getFichesWithLignes(patientId: string): Promise<any[]> {
    const ficheSnapshot = await firstValueFrom(
      this.db.list('fichesSoin', ref => ref.orderByChild('dossierId').equalTo(patientId)).snapshotChanges()
    );
    const fiches = ficheSnapshot.map(c => ({
      id: c.payload.key,
      ...(c.payload.val() as any),
      lignes: []
    }));

    const lignesSnapshot = await firstValueFrom(
      this.db.list('lignesFicheSoin').snapshotChanges()
    );
    const lignes = lignesSnapshot.map(c => ({
      id: c.payload.key,
      ...(c.payload.val() as any)
    }));

    for (const fiche of fiches) {
      fiche.lignes = lignes.filter(ligne => ligne.ficheSoinId === fiche.id);
    }

    return fiches;
  }

  // Modifier une fiche et ses lignes
  async modifierFicheEtLignes(ficheId: string, ficheData: any, lignes: any[]): Promise<void> {
    await this.db.object(`fichesSoin/${ficheId}`).update(ficheData);

    const existingLignesSnapshot = await firstValueFrom(
      this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(ficheId)).snapshotChanges()
    );
    const existingLigneIds = existingLignesSnapshot.map(c => c.payload.key);
    const formLigneIds = lignes.map(l => l.id).filter((id: string | undefined) => id);

    // Supprimer les anciennes lignes non présentes dans le formulaire
    for (const id of existingLigneIds) {
      if (!formLigneIds.includes(id)) {
        await this.db.object(`lignesFicheSoin/${id}`).remove();
      }
    }

    // Ajouter ou mettre à jour les lignes
    for (const ligne of lignes) {
      const ligneData = {
        nom: ligne.nom,
        type: ligne.type,
        dateAjout: ligne.dateAjout,
        contenu: ligne.contenu,
        ficheSoinId: ficheId
      };

      if (ligne.id) {
        await this.db.object(`lignesFicheSoin/${ligne.id}`).update(ligneData);
      } else {
        await this.db.list('lignesFicheSoin').push(ligneData);
      }
    }
  }

  // Supprimer une ligne d'une fiche
  async supprimerLigne(ligneId: string): Promise<void> {
    await this.db.object(`lignesFicheSoin/${ligneId}`).remove();
  }

  // Récupérer les lignes d'une fiche (Observable)
  getLignesFicheSoin(ficheId: string): Observable<any[]> {
    return this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(ficheId))
      .snapshotChanges()
      .pipe(map(lignes => lignes.map(d => ({
        key: d.key,
        ...d.payload.val() as any
      }))));
  }

  deleteFiche(ficheKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Étape 1 : Récupérer toutes les lignes liées à cette fiche
      this.db.list('lignesFicheSoin').snapshotChanges().pipe(take(1)).subscribe(snapshots => {
        const suppressions: Promise<void>[] = [];

        snapshots.forEach(snapshot => {
          const ligneKey = snapshot.key;
          const ligneData = snapshot.payload.val() as any;

          // Vérifie que cette ligne appartient bien à la fiche
          if (ligneData && ligneData.ficheSoinId === ficheKey) {
            const suppression = this.db.object(`lignesFicheSoin/${ligneKey}`).remove()
              .then(() => console.log(` Ligne ${ligneKey} supprimée.`))
              .catch(err => {
                console.error(` Erreur suppression ligne ${ligneKey} :`, err);
                throw err;
              });
            suppressions.push(suppression);
          }
        });

        // Étape 2 : Une fois toutes les lignes supprimées, supprimer la fiche
        Promise.all(suppressions).then(() => {
          this.db.object(`fichesSoin/${ficheKey}`).remove()
            .then(() => {
              console.log(' Fiche supprimée avec succès.');
              resolve(); // Résoudre la promesse une fois la fiche supprimée
            })
            .catch(err => {
              console.error('Erreur lors de la suppression de la fiche :', err);
              reject(err); // Rejeter la promesse en cas d'erreur
            });
        }).catch(err => reject(err)); // Rejeter si une erreur se produit lors de la suppression des lignes
      });
    });
  }

  loadFicheSoinsByDossierId(dossierId: string): Observable<any[]> {
    return this.db.list('fichesSoin', ref =>
      ref.orderByChild('dossierId').equalTo(dossierId)
    ).snapshotChanges().pipe(
      switchMap(ficheChanges => {
        const fiches = ficheChanges.map(c => ({
          id: c.payload.key,
          ...(c.payload.val() as any),
          lignes: []
        }));
  
        return this.db.list('lignesFicheSoin').snapshotChanges().pipe(
          map(ligneChanges => {
            const lignes = ligneChanges.map(c => ({
              id: c.payload.key,
              ...(c.payload.val() as any)
            }));
  
            const lignesParFiche: { [ficheId: string]: any[] } = {};
  
            fiches.forEach(fiche => {
              const lignesFiche = lignes.filter(ligne => ligne.FicheSoinId === fiche.id);
              fiche.lignes = lignesFiche;
              lignesParFiche[fiche.id] = lignesFiche;
            });
  
            // (Optionnel) Tu peux stocker dans localStorage ici si nécessaire
            localStorage.setItem('lignesParFiche', JSON.stringify(lignesParFiche));
  
            return fiches;
          })
        );
      })
    );
  }

  voirLignesByFicheId(ficheId: string): Observable<any[]> {
    return this.db.list('lignesFicheSoin', ref =>
      ref.orderByChild('ficheSoinId').equalTo(ficheId)
    ).valueChanges();
  }
  
  
}
