import { Component, Inject, Input } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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

    cloudName = 'dxc5curxy';
    uploadPreset = 'ProjectMedicale';
    patientId: string;

    constructor(
      private fb: FormBuilder,
      private db: AngularFireDatabase,
      private dialogRef: MatDialogRef<AddAnalyseComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.imageForm = this.fb.group({
        numero: ['', Validators.required],
        agentCreateur: ['', Validators.required],
        adresseCreateur: ['', Validators.required]
      });

      this.patientId = data.patientId;
      this.imageForm.get("numero")?.disable();
      this.db.list('analysesMedicales', ref =>
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

    ajouterAnalyseMedicale(): void {
      const formValue = this.imageForm.getRawValue();
     
      if (!this.selectedFile) {
        alert('Veuillez sélectionner un fichier.');
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
    
          const dossierId = dossiers[0].key;
    
          const formData = new FormData();
          formData.append('UPLOADCARE_PUB_KEY', '9d7b4bd0a0c2fc3b2f8c'); // ⬅️ Remplace par ta vraie clé
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
              console.log('Réponse Uploadcare :', data); // { file: "uuid" }
    
              const uuid = data.file;
              const fichierUrl = `https://ucarecdn.com/${uuid}/${this.selectedFile!.name}`;
    
              const imageData = {
                numero: formValue.numero,
                agentCreateur: this.imageForm.value.agentCreateur,
                adresseCreateur: this.imageForm.value.adresseCreateur,
                dateCreation: new Date().toISOString(),
                dossierId: dossierId,
                fichier: fichierUrl
              };
              console.log(imageData);

             
    
              return this.db.list('analysesMedicales').push(imageData);
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
