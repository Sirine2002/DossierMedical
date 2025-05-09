import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AnalyseService } from '../../Services/analyse.service';

@Component({
  selector: 'app-add-analyse',
  templateUrl: './add-analyse.component.html',
  styleUrls: ['./add-analyse.component.css']
})
export class AddAnalyseComponent {
  @Input() patient: any;
  imageForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  patientId: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddAnalyseComponent>,
    private analyseService: AnalyseService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.imageForm = this.fb.group({
      numero: ['', Validators.required],
      agentCreateur: ['', Validators.required],
      adresseCreateur: ['', Validators.required]
    });

    this.patientId = data.patientId;
    this.imageForm.get("numero")?.disable();

    // ✅ Utilisation du service pour récupérer le dernier numéro
    this.analyseService.getLastAnalyseNumero().subscribe(maxNumero => {
      const newNumero = maxNumero + 1;
      this.imageForm.patchValue({ numero: newNumero });
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  ajouterAnalyseMedicale(): void {
    const formValue = this.imageForm.getRawValue();

    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier.');
      return;
    }

    this.isUploading = true;

    this.analyseService.getDossierIdByPatient(this.patientId).subscribe(dossierId => {
      if (!dossierId) {
        console.error('Aucun dossier trouvé pour ce patient.');
        this.isUploading = false;
        return;
      }

      const formData = new FormData();
      formData.append('UPLOADCARE_PUB_KEY', '9d7b4bd0a0c2fc3b2f8c'); // 🔐 Remplacer par ta vraie clé
      formData.append('file', this.selectedFile!);

      fetch('https://upload.uploadcare.com/base/', {
        method: 'POST',
        body: formData
      })
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            console.error('Erreur Uploadcare :', errorText);
            throw new Error(`Échec de l’upload : ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          const uuid = data.file;
          const fichierUrl = `https://ucarecdn.com/${uuid}/${this.selectedFile!.name}`;

          const imageData = {
            numero: formValue.numero,
            agentCreateur: formValue.agentCreateur,
            adresseCreateur: formValue.adresseCreateur,
            dateCreation: new Date().toISOString(),
            dossierId,
            fichier: fichierUrl
          };

          // ✅ Utilisation du service pour ajouter l’analyse
          return this.analyseService.addAnalyseMedicale(imageData);
        })
        .then(() => {
          this.imageForm.reset();
          this.selectedFile = null;
          this.dialogRef.close(); // Ferme le dialog après succès
        })
        .catch(err => {
          console.error('Erreur lors de l\'upload ou de la sauvegarde Firebase :', err);
          alert("Erreur lors de l'upload du fichier.");
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
