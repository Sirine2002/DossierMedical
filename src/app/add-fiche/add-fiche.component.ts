import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FicheService } from '../../Services/fiche.service'; // Adapter le chemin

@Component({
  selector: 'app-add-fiche',
  templateUrl: './add-fiche.component.html',
  styleUrls: ['./add-fiche.component.css']
})
export class AddFicheComponent implements OnInit {
  @Input() patient: any;
  ficheForm: FormGroup;
  ficheSoins: any[] = [];
  patientId: any;
  newNum: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ficheService: FicheService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.ficheForm = this.fb.group({
      numero: ['', Validators.required],
      agentCreateur: ['', Validators.required],
      adresseCreateur: ['', Validators.required],
      lignesFiche: this.fb.array([])
    });

    this.patientId = data.patientId;
    this.ficheForm.get("numero")?.disable();
  }

  async ngOnInit(): Promise<void> {
    const numero = await this.ficheService.getDernierNumeroFiche();
    this.ficheForm.patchValue({ numero });
    this.newNum = numero;
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

  async ajouterFicheSoin(): Promise<void> {
    if (!this.patientId) {
      console.error("Patient non défini !");
      return;
    }

    const dossierId = await this.ficheService.getDossierIdByPatient(this.patientId);
    if (!dossierId) {
      console.error("Aucun dossier trouvé pour ce patient !");
      return;
    }

    const ficheData = {
      numero: this.newNum,
      agentCreateur: this.ficheForm.value.agentCreateur,
      adresseCreateur: this.ficheForm.value.adresseCreateur,
      dateCreation: new Date().toISOString(),
      dossierId: dossierId
    };

    await this.ficheService.ajouterFicheEtLignes(ficheData, this.ficheForm.value.lignesFiche);
    this.loadFicheSoins();
    this.ficheForm.reset();
    this.lignesFiche.clear();
  }

  async loadFicheSoins(): Promise<void> {
    if (!this.patient || !this.patient.id) return;
    this.ficheSoins = await this.ficheService.getFichesWithLignes(this.patient.id);
  }

  cancelFicheForm(): void {
    this.ficheForm.reset();
    this.lignesFiche.clear();
  }
}
