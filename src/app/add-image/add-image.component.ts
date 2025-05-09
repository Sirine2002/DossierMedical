import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageService } from '../../Services/image.service'; // Importation du service ImageService

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

  patientId: string;

  constructor(
    private fb: FormBuilder,
    private imageService: ImageService, // Utilisation du service ImageService
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
    
    this.imageService.getPatientDossiers(this.patientId).subscribe(dossiers => {
      if (dossiers.length > 0) {
        const maxFiche = dossiers[0].payload.val();
        const maxNumero = maxFiche?.numero ?? 0;
        const newNumero = parseInt(maxNumero) + 1;
        this.imageForm.patchValue({ numero: newNumero });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  ajouterImageMedicale(): void {
    const formValue = this.imageForm.getRawValue();
    if (!this.selectedFile) {
      alert('Veuillez sélectionner une image.');
      return;
    }

    this.isUploading = true;

    // On récupère le dossier du patient et on upload l'image
    this.imageService.getPatientDossiers(this.patientId).subscribe(dossiers => {
      if (dossiers.length === 0) {
        console.error('Aucun dossier trouvé pour ce patient.');
        this.isUploading = false;
        return;
      }

      // On suppose ici qu'il n'y a qu'un seul dossier par patient
      const dossierId = dossiers[0].key;

      this.imageService.uploadImage(this.selectedFile!).then(imageUrl => {
        const imageData = {
          numero: formValue.numero,
          agentCreateur: this.imageForm.value.agentCreateur,
          adresseCreateur: this.imageForm.value.adresseCreateur,
          dateCreation: new Date().toISOString(),
          dossierId: dossierId,
          image: imageUrl
        };

        return this.imageService.addImage(imageData);
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
