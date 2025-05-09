import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FicheService } from '../../Services/fiche.service'; // Importation de FicheService

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
    private ficheService: FicheService, // Utilisation du service FicheService
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
    this.ficheForm.get("numero")?.disable(); // On désactive le champ numéro
  }

  ngOnInit(): void {
    this.loadFiche();
  }

  get lignesFiche(): FormArray {
    return this.ficheForm.get('lignesFiche') as FormArray;
  }

  loadFiche(): void {
    this.ficheService.getFicheById(this.ficheId).subscribe((fiche: any) => {
      if (fiche) {
        this.ficheForm.patchValue({
          numero: fiche.numero,
          agentCreateur: fiche.agentCreateur,
          adresseCreateur: fiche.adresseCreateur
        });

        this.ficheService.getLignesByFicheId(this.ficheId).subscribe(changes => {
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
      this.ficheService.supprimerLigne(id).then(() => {
        this.lignesFiche.removeAt(index);
      }).catch(error => {
        console.error('Erreur lors de la suppression de la ligne :', error);
      });
    } else {
      this.lignesFiche.removeAt(index);
    }
  }

  modifierFicheSoin(): void {
    const formValue = this.ficheForm.getRawValue();
    const ficheData = {
      numero: formValue.numero,
      agentCreateur: formValue.agentCreateur,
      adresseCreateur: formValue.adresseCreateur
    };

    // Mise à jour de la fiche et des lignes via le service
    this.ficheService.modifierFicheEtLignes(this.ficheId, ficheData, formValue.lignesFiche).then(() => {
      this.dialogRef.close(true); // Ferme le dialog après succès
    }).catch(error => {
      console.error('Erreur lors de la mise à jour de la fiche et des lignes :', error);
    });
  }

  cancel(): void {
    this.dialogRef.close(false); // Ferme le dialog sans sauvegarder
  }
}
