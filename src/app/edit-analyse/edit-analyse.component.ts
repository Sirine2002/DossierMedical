import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AnalyseService } from '../../Services/analyse.service'; 

@Component({
  selector: 'app-edit-analyse',
  templateUrl: './edit-analyse.component.html',
  styleUrls: ['./edit-analyse.component.css']
})
export class EditAnalyseComponent {
  imageForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditAnalyseComponent>,
    private analyseService: AnalyseService,
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

  async modifierImageMedicale(): Promise<void> {
    const formValue = this.imageForm.getRawValue();
    this.isUploading = true;

    try {
      let imageUrl: string | null = null;

      if (this.selectedFile) {
        imageUrl = await this.analyseService.uploadFileToCloudinary(this.selectedFile);
      }

      const updateData: any = {
        numero: formValue.numero,
        agentCreateur: this.imageForm.value.agentCreateur,
        adresseCreateur: this.imageForm.value.adresseCreateur,
      };

      if (imageUrl) {
        updateData.fichier = imageUrl;
      }

      await this.analyseService.updateAnalyse(this.data.imageKey, updateData);
      this.dialogRef.close();
    } catch (error) {
      console.error('Erreur lors de la mise à jour ou de l\'upload :', error);
    } finally {
      this.isUploading = false;
    }
  }

  cancelEdit(): void {
    this.dialogRef.close();
  }
}
