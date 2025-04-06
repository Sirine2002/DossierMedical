// src/app/patient-details-page/patient-details-page.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-patient-details-page',
  templateUrl: './patient-details-page.component.html',
  styleUrls: ['./patient-details-page.component.css']
})
export class PatientDetailsPageComponent implements OnInit {
  patient: any;
  codeConfidentiel: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.patient = history.state.data;
  }

  validerCode() {
    console.log('Code saisi :', this.codeConfidentiel);
    // Tu peux ici appeler un service pour valider et charger le dossier médical
  }
}
