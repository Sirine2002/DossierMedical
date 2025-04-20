import { Component, Input, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-add-fiche',
  templateUrl: './add-fiche.component.html',
  styleUrls: ['./add-fiche.component.css']
})
export class AddFicheComponent {
  @Input() patient: any;
  ficheForm: FormGroup;
  ficheSoins: any[] = [];
  patientId: any;

  constructor(
    private fb: FormBuilder,
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any // 👈 ici on récupère les data envoyées
  ) {
    this.ficheForm = this.fb.group({
      numero: ['', Validators.required],
      agentCreateur: ['', Validators.required],
      adresseCreateur: ['', Validators.required],
      lignesFiche: this.fb.array([])
    });

    this.patientId = data.patientId; 
    this.ficheForm.get("numero")?.disable();

    this.db.list('fichesSoin', ref =>
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
      this.ficheForm.patchValue({ numero: newNumero }); // 👈 mise à jour du numéro
    });
    
}


  get lignesFiche(): FormArray {
    return this.ficheForm.get('lignesFiche') as FormArray;
  }

  ajouterLigne(): void {
    const ligne = this.fb.group({
      nom: ['', Validators.required],
      type: ['', Validators.required],
      dateAjout: ['', Validators.required],
      contenu: ['', Validators.required]
    });
    this.lignesFiche.push(ligne);
  }

  retirerLigne(index: number): void {
    this.lignesFiche.removeAt(index);
  }

  ajouterFicheSoin(): void {
    if (!this.patientId) {
      console.error("Patient non défini !");
      return;
    }

    this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(this.patientId))
      .snapshotChanges()
      .subscribe(dossiers => {
        if (dossiers.length === 0) {
          console.error("Aucun dossier trouvé pour ce patient !");
          return;
        }

        const dossierId = dossiers[0].key!;
        const ficheData = {
          numero: this.ficheForm.value.numero,
          agentCreateur: this.ficheForm.value.agentCreateur,
          adresseCreateur: this.ficheForm.value.adresseCreateur,
          dateCreation: new Date().toISOString(),
          dossierId: dossierId
        };

        const lignes = [...this.ficheForm.value.lignesFiche];

        this.db.list('fichesSoin').push(ficheData).then(ref => {
          const ficheSoinId = ref.key;

          lignes.forEach(ligne => {
            const ligneFiche = {
              ...ligne,
              ficheSoinId
            };
            this.db.list('lignesFicheSoin').push(ligneFiche);
          });

          this.loadFicheSoins();
          this.ficheForm.reset();
          this.lignesFiche.clear();
        });
      });
  }

  loadFicheSoins(): void {
    if (!this.patient || !this.patient.id) return;

    this.db.list('fichesSoin', ref =>
      ref.orderByChild('dossierId').equalTo(this.patient.id)
    )
    .snapshotChanges()
    .subscribe(ficheChanges => {
      const fiches = ficheChanges.map(c => ({
        id: c.payload.key,
        ...(c.payload.val() as any),
        lignes: []
      }));

      this.db.list('lignesFicheSoin')
        .snapshotChanges()
        .subscribe(ligneChanges => {
          const lignes = ligneChanges.map(c => ({
            id: c.payload.key,
            ...(c.payload.val() as any)
          }));

          fiches.forEach(fiche => {
            fiche.lignes = lignes.filter(ligne => ligne.ficheSoinId === fiche.id);
          });

          this.ficheSoins = fiches;
        });
    });
  }

  cancelFicheForm(): void {
    this.ficheForm.reset();
    this.lignesFiche.clear();
  }
}