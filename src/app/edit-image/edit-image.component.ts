import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageService } from '../../Services/image.service'; // <-- Import du service

@Component({
  selector: 'app-edit-image',
  templateUrl: './edit-image.component.html',
  styleUrls: ['./edit-image.component.css']
})
export class EditImageComponent {
  imageForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private imageService: ImageService, // <-- Injection du service
    private dialogRef: MatDialogRef<EditImageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
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

      this.imageService.updateImage(this.data.imageKey, newData)
        .then(() => this.dialogRef.close())
        .catch(err => console.error('Erreur lors de la mise à jour :', err))
        .finally(() => this.isUploading = false);
    };

    if (this.selectedFile) {
      this.imageService.uploadImage(this.selectedFile)
        .then(imageUrl => updateImageData(imageUrl))
        .catch(err => {
          console.error('Erreur d\'upload Cloudinary :', err);
          this.isUploading = false;
        });
    } else {
      updateImageData();
    }
  }

  cancelEdit(): void {
    this.dialogRef.close();
  }
}
