import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-dossier-details',
  templateUrl: './dossier-details.component.html',
  styleUrls: ['./dossier-details.component.css']
})
export class DossierDetailsComponent implements OnInit {
  patient: any;

  constructor(private router: Router, private db: AngularFireDatabase) {}

  ngOnInit(): void {
    const initialPatient = history.state.patient;

    if (!initialPatient || !initialPatient.id) {
      console.error("Aucun patient transmis !");
      return;
    }

    // Commence avec les infos déjà disponibles
    this.patient = { ...initialPatient };

    // Complète les infos à partir de la table 'patients'
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
}