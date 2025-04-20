import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-image',
  templateUrl: './add-image.component.html',
  styleUrls: ['./add-image.component.css']
})
export class AddImageComponent {
  @Input() patient: any;
  imageForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;

  cloudName = 'dxc5curxy';
  uploadPreset = 'ProjectMedicale';
  patientId: string;

  constructor(
    private fb: FormBuilder,
    private db: AngularFireDatabase,
    private dialogRef: MatDialogRef<AddImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.imageForm = this.fb.group({
      numero: ['', Validators.required],
      agentCreateur: ['', Validators.required],
      adresseCreateur: ['', Validators.required]
    });

    this.patientId = data.patientId;
    this.imageForm.get("numero")?.disable();
    this.db.list('imagesMedicales', ref =>
      ref.orderByChild('numero').limitToLast(1) // 👈 récupère le dernier (le plus grand)
    )
    .snapshotChanges()
    .subscribe(ficheChanges => {
      const maxFiche = ficheChanges.map(c => ({
        id: c.payload.key,
        ...(c.payload.val() as any)
      }))[0]; // Il y a normalement un seul élément ici
    
      const maxNumero = maxFiche?.numero ?? 0; // 👈 récupération du numero
      console.log('Max numero:', maxNumero);
      const newNumero = parseInt(maxNumero) + 1; // 👈 incrémentation
      this.imageForm.patchValue({ numero: newNumero }); // 👈 mise à jour du numéro
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  ajouterImageMedicale(): void {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner une image.');
      return;
    }

    this.isUploading = true;

    this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(this.patientId))
      .snapshotChanges()
      .subscribe(dossiers => {
        if (dossiers.length === 0) {
          console.error('Aucun dossier trouvé pour ce patient.');
          this.isUploading = false;
          return;
        }

        // On suppose ici qu'il n'y a qu'un seul dossier par patient
        const dossierId = dossiers[0].key;

        const formData = new FormData();
        formData.append('file', this.selectedFile!);
        formData.append('upload_preset', this.uploadPreset);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

        fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData
        })
          .then(res => res.json())
          .then(data => {
            const imageUrl = data.secure_url;

            const imageData = {
              numero: this.imageForm.value.numero,
              agentCreateur: this.imageForm.value.agentCreateur,
              adresseCreateur: this.imageForm.value.adresseCreateur,
              dateCreation: new Date().toISOString(),
              dossierId: dossierId,
              image: imageUrl
            };

            return this.db.list('imagesMedicales').push(imageData);
          })
          .then(() => {
            this.imageForm.reset();
            this.selectedFile = null;
            this.dialogRef.close(); // Ferme le dialog après succès
          })
          .catch(err => {
            console.error('Erreur lors de l\'upload ou de la sauvegarde Firebase :', err);
          })
          .finally(() => {
            this.isUploading = false;
          });
      });
  }

  cancelFicheForm(): void {
    this.imageForm.reset();
    this.selectedFile = null;
  }
}