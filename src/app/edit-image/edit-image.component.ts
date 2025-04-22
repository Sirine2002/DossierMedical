import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-image',
  templateUrl: './edit-image.component.html',
  styleUrls: ['./edit-image.component.css']
})
export class EditImageComponent {
  imageForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;

  cloudName = 'dxc5curxy';
  uploadPreset = 'ProjectMedicale';

  constructor(
    private fb: FormBuilder,
    private db: AngularFireDatabase,
    private dialogRef: MatDialogRef<EditImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initialiser le formulaire avec les données existantes
    this.imageForm = this.fb.group({
      numero: [data.image.numero, Validators.required],
      agentCreateur: [data.image.agentCreateur, Validators.required],
      adresseCreateur: [data.image.adresseCreateur, Validators.required]
    });
    this.imageForm.get("numero")?.disable();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  modifierImageMedicale(): void {
    this.isUploading = true;
    const formValue = this.imageForm.getRawValue();

    const updateImageData = (imageUrl: string | null = null) => {
      
      const newData: any = {
        numero: formValue.numero,
        agentCreateur: this.imageForm.value.agentCreateur,
        adresseCreateur: this.imageForm.value.adresseCreateur,
      };

      if (imageUrl) {
        newData.image = imageUrl;
      }

      this.db.object(`imagesMedicales/${this.data.imageKey}`).update(newData)
        .then(() => {
          this.dialogRef.close();
        })
        .catch(err => console.error('Erreur lors de la mise à jour :', err))
        .finally(() => {
          this.isUploading = false;
        });
    };

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('upload_preset', this.uploadPreset);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

      fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          const imageUrl = data.secure_url;
          updateImageData(imageUrl);
        })
        .catch(err => {
          console.error('Erreur d\'upload Cloudinary :', err);
          this.isUploading = false;
        });
    } else {
      // Aucun nouveau fichier, mise à jour uniquement des champs texte
      updateImageData();
    }
  }

  cancelEdit(): void {
    this.dialogRef.close();
  }
}
