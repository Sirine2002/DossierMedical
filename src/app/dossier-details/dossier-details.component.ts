import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dossier-details',
  templateUrl: './dossier-details.component.html',
  styleUrls: ['./dossier-details.component.css']
})
export class DossierDetailsComponent implements OnInit {
  patient: any;
  accessForm!: FormGroup;
  imagesVisibles = false;

  // listeImagesIRM: string[] = [
  //   'assets/images/irm1.jpg',
  //   'assets/images/irm2.jpg',
  //   'assets/images/irm3.jpg',
  //   'assets/images/irm4.jpg'

  // ];
  listeImagesIRM = [
    {
      url: 'assets/images/irm1.jpg',
      type: 'IRM Cérébrale',
      date: '2024-03-10',
      medecin: 'Dr. Dupont'
    },
    {
      url: 'assets/images/irm2.jpg',
      type: 'Scanner Thoracique',
      date: '2024-01-22',
      medecin: 'Dr. Martin'
    },
    {
      url: 'assets/images/irm3.jpg',
      type: 'Scanner Thoracique',
      date: '2024-01-22',
      medecin: 'Dr. Martin'
    },
    {
      url: 'assets/images/irm4.jpg',
      type: 'Scanner Thoracique',
      date: '2024-01-22',
      medecin: 'Dr. Martin'
    }
    // etc.
  ];
  
  
  constructor(
    private router: Router,
    private db: AngularFireDatabase,
    private fb: FormBuilder,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.accessForm = this.fb.group({
      code: ['', Validators.required]
    });

    const initialPatient = history.state.patient;

    if (!initialPatient || !initialPatient.id) {
      console.error("Aucun patient transmis !");
      return;
    }

    this.patient = { ...initialPatient };

    this.db.list('patients', ref => ref.orderByChild('utilisateurId').equalTo(initialPatient.id))
      .valueChanges()
      .subscribe(patients => {
        if (patients.length > 0) {
          const patientDetails = patients[0] as any;

          this.patient = {
            ...this.patient,
            adresse: patientDetails.adresse,
            sexe: patientDetails.sexe
          };
        }
      });
  }


  onScanQR() {
    console.log("Scan QR lancé...");
    const fakeCode = '123456';
    this.accessForm.patchValue({ code: fakeCode });
    alert("Code QR scanné avec succès !");

  }
  onAccessSubmit() {
    const code = this.accessForm.value.code;
    console.log("Code soumis:", code);
  
    // 👉 Exemple simple : tu peux faire une vraie vérification ici si tu veux
    if (code === '123456') {
      this.imagesVisibles = true;
    } else {
      alert("Code incorrect !");
    }
  }
  retour(): void {
    this.location.back();
  }
  
}