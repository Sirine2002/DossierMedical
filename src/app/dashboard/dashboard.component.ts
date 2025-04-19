import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

interface PatientData {
  id: string;
  fullName: string;
  dateNaissance: string;
  phone: string;
  email: string;
  sexe: string;
  adresse: string;
  dateCreation: string;
  numero: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit, OnInit {
  dataSourceOriginal: PatientData[] = [];
  dataSource: PatientData[] = [];
  selectedPatient?: PatientData;
  filteredDataSource: PatientData[] = [];

  ficheSoin = new MatTableDataSource<any>();
  images: any[] = [];
  analyses: any[] = [];

  hoverImage: boolean = false;
  selectedAnalyse: any = null;
  isAnalyseModalOpen: boolean = false;
  selectedImage: any = null;
  isImageModalOpen: boolean = false;
  isFicheModalOpen: boolean = false;
  selectedFiche: any = null;
  showFilters: boolean = false;
  userrole: string | null = localStorage.getItem('userRole');

  // Champ de recherche global
  searchTerm: string = '';

  displayedColumns: string[] = ['numero', 'dateCreation', 'agentCreateur', 'adresseCreateur', 'actions'];
  displayedColumns1: string[] = ['nom', 'type', 'dateAjout', 'contenu'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  roleAcces: 'none' | 'Medecin' | 'Radiologue' | 'Analyste' = 'none';

  codeForm = new FormGroup({
    code: new FormControl('', Validators.required)
  });

  currentPage: number = 0;

  constructor(private db: AngularFireDatabase, private router: Router) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  ngAfterViewInit(): void {
    this.ficheSoin.paginator = this.paginator;
    this.applyPagination();
  }

  loadPatients() {
    this.db.list('users').snapshotChanges().subscribe(users => {
      const patientsUsers = users.filter(user => (user.payload.val() as any).role === 'Patient');

      patientsUsers.forEach(user => {
        const userId = user.key!;
        const userInfo = user.payload.val() as any;

        this.db.list('patients', ref => ref.orderByChild('utilisateurId').equalTo(userId))
          .valueChanges()
          .subscribe(patients => {
            if (patients.length > 0) {
              const patientInfo = patients[0] as any;
              this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(userId))
                .valueChanges()
                .subscribe(dossiers => {
                  if (dossiers.length > 0) {
                    const dossier = dossiers[0] as any;
                    const patientData: PatientData = {
                      id: userId,
                      fullName: `${userInfo.firstName} ${userInfo.lastName}`,
                      dateNaissance: patientInfo.dateNaissance,
                      phone: userInfo.phone,
                      email: userInfo.email,
                      sexe: patientInfo.sexe,
                      adresse: patientInfo.adresse,
                      dateCreation: dossier.dateCreation,
                      numero: dossier.numero,
                    };

                    const exists = this.dataSourceOriginal.find(p => p.id === patientData.id);
                    if (!exists) {
                      this.dataSourceOriginal.push(patientData);
                      this.applyFilters();
                    }
                  }
                });
            }
          });
      });
    });
  }

  paginate(source: PatientData[]) {
    const startIndex = this.currentPage * 10;
    const endIndex = startIndex + 10;
    this.dataSource = source.slice(startIndex, endIndex);
  }

  // Nouveau filtre avec un seul champ de recherche
  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.dataSourceOriginal.filter(patient => {
      const fullNameMatch = patient.fullName.toLowerCase().includes(term);
      const numeroMatch = patient.numero.toString().includes(term);
      const dateMatch = new Date(patient.dateCreation).toISOString().slice(0, 10).includes(term);
      return fullNameMatch || numeroMatch || dateMatch;
    });

    this.currentPage = 0;
    this.paginate(filtered);
  }

  // Pagination avec le filtre appliqué
  pageEvent(event: any) {
    this.currentPage = event.pageIndex;
    const term = this.searchTerm.toLowerCase();
    const filtered = this.dataSourceOriginal.filter(patient => {
      const fullNameMatch = patient.fullName.toLowerCase().includes(term);
      const numeroMatch = patient.numero.toString().includes(term);
      const dateMatch = new Date(patient.dateCreation).toISOString().slice(0, 10).includes(term);
      return fullNameMatch || numeroMatch || dateMatch;
    });

    this.paginate(filtered);
  }

  applyPagination() {
    const startIndex = this.currentPage * 10;
    const endIndex = startIndex + 10;
    this.dataSource = this.dataSourceOriginal.slice(startIndex, endIndex);
  }

  voirDossier(patient: PatientData): void {
    this.router.navigate(['/dossier-details', patient.id]);
  }

  formatPatientNumero(num: number): string {
    const prefix = '2025';
    const numStr = num.toString();
    const zerosNeeded = 9 - prefix.length - numStr.length;
    const zeroPadding = '0'.repeat(Math.max(0, zerosNeeded));
    return `${prefix}${zeroPadding}${numStr}`;
  }
}
