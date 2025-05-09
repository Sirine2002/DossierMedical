import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ChartConfiguration, ChartData, ChartDataset, ChartOptions } from 'chart.js';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-charts',
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.css']
})
export class DashboardChartsComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  service: string = '';
  patientCount: number = 0;
  analyseCount: number = 0;
  imageCount: number = 0;
  ficheCount: number = 0;
  femmeCount: number = 0;
  hommeCount: number = 0;

  searchTerm: string = '';
  displayedColumns: string[] = ['nom', 'numero', 'date'];
  dataSource = new MatTableDataSource<any>();
  dataSource1 = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();
  dataSource3 = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private db: AngularFireDatabase) {}

  ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const medecinData = JSON.parse(localStorage.getItem('medecinData') || '{}');
    this.firstName = userData.firstName || 'Inconnu';
    this.lastName = userData.lastName || 'Inconnue';
    this.service = medecinData.specialite || 'Inconnue';

    this.loadPatients();
    this.loadAnalyses();
    this.loadImages();
    this.loadFiches();
    this.loadPatientDetails();

  }

  loadPatients() {
    this.db.list('patients').snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...(c.payload.val() as any) }))
      )
    ).subscribe(data => {
      this.dataSource.data = data;
      this.patientCount = data.length;
      this.updateAgeDistributionChart(data);

      this.hommeCount = 0;
      this.femmeCount = 0;
      data.forEach(patient => {
        const sexe = patient.sexe?.toLowerCase();
        if (sexe === 'homme' || sexe === 'm') this.hommeCount++;
        else if (sexe === 'femme' || sexe === 'f') this.femmeCount++;
      });

      this.chartDatapie = [
        { data: [this.hommeCount, this.femmeCount], backgroundColor: ['#42A5F5', '#EF5350'] }
      ];
    });
  }

  loadAnalyses() {
    this.db.list('analysesMedicales').snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...(c.payload.val() as any) }))
      )
    ).subscribe(data => {
      this.dataSource1.data = data;
      this.analyseCount = data.length;

      const analysesParMois = Array(12).fill(0);
      const anneeCourante = new Date().getFullYear();
      data.forEach(analyse => {
        if (analyse.dateCreation) {
          const date = new Date(analyse.dateCreation);
          if (date.getFullYear() === anneeCourante) {
            analysesParMois[date.getMonth()]++;
          }
        }
      });

      this.chartDataAnalyses = [
        { label: 'Analyses médicales par mois', data: analysesParMois, fill: false, tension: 0.3, borderColor: 'orange' }
      ];
    });
  }

  loadImages() {
    this.db.list('imagesMedicales').snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...(c.payload.val() as any) }))
      )
    ).subscribe(data => {
      this.dataSource2.data = data;
      this.imageCount = data.length;

      const imagesParMois = Array(12).fill(0);
      const anneeCourante = new Date().getFullYear();
      data.forEach(image => {
        if (image.dateCreation) {
          const date = new Date(image.dateCreation);
          if (date.getFullYear() === anneeCourante) {
            imagesParMois[date.getMonth()]++;
          }
        }
      });

      this.chartDataImages = [
        { label: 'Images médicales par mois', data: imagesParMois, fill: false, tension: 0.3, borderColor: 'purple' }
      ];
    });
  }

  loadFiches() {
    this.db.list('fichesSoin').snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...(c.payload.val() as any) }))
      )
    ).subscribe(data => {
      this.dataSource3.data = data;
      this.ficheCount = data.length;

      const fichesParMois = Array(12).fill(0);
      const anneeCourante = new Date().getFullYear();
      data.forEach(fiche => {
        if (fiche.dateCreation) {
          const date = new Date(fiche.dateCreation);
          if (date.getFullYear() === anneeCourante) {
            fichesParMois[date.getMonth()]++;
          }
        }
      });

      this.chartData = [
        { label: 'Fiches de soin par mois', data: fichesParMois, fill: false, tension: 0.3, borderColor: 'blue' }
      ];
    });
  }

  updateAgeDistributionChart(patients: any[]) {
    const ageGroups = { '0-18': 0, '19-35': 0, '36-60': 0, '60+': 0 };
    const today = new Date();
    patients.forEach(patient => {
      if (patient.dateNaissance) {
        const birthDate = new Date(patient.dateNaissance);
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 60) ageGroups['36-60']++;
        else ageGroups['60+']++;
      }
    });
    this.chartDatadonu = [
      { data: Object.values(ageGroups), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'] }
    ];
  }
  loadPatientDetails() {
    this.db.list('dossier').snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...(c.payload.val() as any) }))
      )
    ).subscribe(patients => {
      const ficheCounts: number[] = [];
      const analyseCounts: number[] = [];
      const imageCounts: number[] = [];
      const patientNames: string[] = [];

      let processed = 0;
      const totalPatients = patients.length;

      patients.forEach(patient => {
        patientNames.push("N°"+patient.numero || patient.key || 'Inconnu');

        this.db.list('fichesSoin', ref => ref.orderByChild('dossierId').equalTo(patient.key)).valueChanges().subscribe(fiches => {
          ficheCounts.push(fiches.length);

          this.db.list('analysesMedicales', ref => ref.orderByChild('dossierId').equalTo(patient.key)).valueChanges().subscribe(analyses => {
            analyseCounts.push(analyses.length);

            this.db.list('imagesMedicales', ref => ref.orderByChild('dossierId').equalTo(patient.key)).valueChanges().subscribe(images => {
              imageCounts.push(images.length);

              processed++;
              if (processed === totalPatients) {
                // Quand tous les patients ont été traités
                this.chartLabelsPerPatient = patientNames;
                this.chartDataPerPatient = [
                  { label: 'Fiches de soin', data: ficheCounts, backgroundColor: '#42A5F5' },
                  { label: 'Analyses médicales', data: analyseCounts, backgroundColor: '#66BB6A' },
                  { label: 'Images médicales', data: imageCounts, backgroundColor: '#FFA726' }
                ];
              }
            });
          });
        });
      });
    });
  }



  applyFilters(): void {
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  // Graphiques initiaux
  chartDatapie: ChartDataset[] = [{ data: [] }];
  chartLabelspie: string[] = ['Hommes', 'Femmes'];

  chartData: ChartDataset[] = [];
  chartLabels: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  chartDataAnalyses: ChartDataset[] = [];
  chartDataImages: ChartDataset[] = [];


  chartDataPerPatient: ChartDataset[] = [];
chartLabelsPerPatient: string[] = [];




  chartDatabar: ChartDataset[] = [
    { label: 'Nombre de patients par service', data: [50, 30, 40, 20, 60], backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043'] }
  ];
  chartLabelsbar: string[] = ['Cardio', 'Ortho', 'Gynéco', 'Pédiatrie', 'Général'];

  chartDatadonu: ChartDataset[] = [
    { data: [25, 35, 20, 20], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'] }
  ];
  chartLabelsdonu: string[] = ['0-18 ans', '19-35 ans', '36-60 ans', '60+ ans'];

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { display: true, position: 'bottom' } }
  };




  
}