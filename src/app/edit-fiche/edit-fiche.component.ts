import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-fiche',
  templateUrl: './edit-fiche.component.html',
  styleUrls: ['./edit-fiche.component.css']
})
export class EditFicheComponent implements OnInit {
  ficheForm: FormGroup;
  ficheId: string = '';
  lignesInitiales: any[] = [];

  constructor(
    private fb: FormBuilder,
    private db: AngularFireDatabase,
    private dialogRef: MatDialogRef<EditFicheComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.ficheForm = this.fb.group({
      numero: ['', Validators.required],
      agentCreateur: ['', Validators.required],
      adresseCreateur: ['', Validators.required],
      lignesFiche: this.fb.array([]),
    });

    this.ficheId = data.ficheKey;
    this.ficheForm.get("numero")?.disable(); // Correction ici
  }

  ngOnInit(): void {
    this.loadFiche();
  }

  get lignesFiche(): FormArray {
    return this.ficheForm.get('lignesFiche') as FormArray;
  }

  loadFiche(): void {
    this.db.object(`fichesSoin/${this.ficheId}`).valueChanges().subscribe((fiche: any) => {
      if (fiche) {
        this.ficheForm.patchValue({
          numero: fiche.numero,
          agentCreateur: fiche.agentCreateur,
          adresseCreateur: fiche.adresseCreateur
        });

        this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(this.ficheId))
          .snapshotChanges()
          .subscribe(changes => {
            this.lignesFiche.clear();
            changes.forEach(change => {
              const ligne = change.payload.val() as any;
              const id = change.payload.key;

              this.lignesFiche.push(this.fb.group({
                id: [id],
                nom: [ligne.nom, Validators.required],
                type: [ligne.type, Validators.required],
                dateAjout: [ligne.dateAjout, Validators.required],
                contenu: [ligne.contenu, Validators.required]
              }));
            });
          });
      }
    });
  }

  ajouterLigne(): void {
    this.lignesFiche.push(this.fb.group({
      nom: ['', Validators.required],
      type: ['', Validators.required],
      dateAjout: ['', Validators.required],
      contenu: ['', Validators.required],
      ficheSoinId: [this.ficheId]  // Ajout de l'ID de la fiche à chaque ligne
    }));
  }

  retirerLigne(index: number): void {
    const ligne = this.lignesFiche.at(index);
    const id = ligne.value.id;
    if (id) {
      this.db.object(`lignesFicheSoin/${id}`).remove();
    }
    this.lignesFiche.removeAt(index);
  }

  modifierFicheSoin(): void {
    const formValue = this.ficheForm.getRawValue();
    const ficheData = {
      numero: formValue.numero,
      agentCreateur: this.ficheForm.value.agentCreateur,
      adresseCreateur: this.ficheForm.value.adresseCreateur
    };

    // Mise à jour de la fiche
    this.db.object(`fichesSoin/${this.ficheId}`).update(ficheData).then(() => {
      this.updateLignesFiche();
    }).catch(error => {
      console.error('Erreur lors de la mise à jour de la fiche :', error);
    });
  }

  updateLignesFiche(): void {
    const idsFormulaire = this.lignesFiche.controls.map(ctrl => ctrl.value.id).filter(id => id);

    // Mise à jour des lignes
    this.lignesFiche.controls.forEach(async (ligneCtrl) => {
      const ligne = ligneCtrl.value;
      const ligneData = {
        nom: ligne.nom,
        type: ligne.type,
        dateAjout: ligne.dateAjout,
        contenu: ligne.contenu,
        ficheSoinId: this.ficheId // Important pour lier la ligne à la fiche
      };

      if (ligne.id) {
        // Mise à jour de la ligne existante
        await this.db.object(`lignesFicheSoin/${ligne.id}`).update(ligneData);
      } else {
        // Ajout d'une nouvelle ligne
        await this.db.list('lignesFicheSoin').push(ligneData);
      }
    });

    // Fermer le dialog une fois les lignes traitées
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
