import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

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
  selector: 'app-dossier-details',
  templateUrl: './dossier-details.component.html',
  styleUrls: ['./dossier-details.component.css']
})
export class DossierDetailsComponent implements OnInit {
  dataSourceOriginal: PatientData[] = [];
  dataSource: PatientData[] = [];
  selectedPatient?: PatientData;

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
  codeInvalide: boolean = false;

  filterValue: string = '';
  displayedColumns: string[] = ['numero', 'dateCreation', 'agentCreateur', 'adresseCreateur', 'actions'];
  displayedColumns1: string[] = ['nom', 'type', 'dateAjout', 'contenu'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  roleAcces: 'none' | 'Medecin' | 'Radiologue' | 'Analyste' = 'none';

  codeForm = new FormGroup({
    code: new FormControl('', Validators.required)
  });

  currentPage: number = 0;

  constructor(
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const patientIdFromUrl = params.get('id');
      this.loadPatients(patientIdFromUrl!);
    });
  }

  ngAfterViewInit(): void {
    this.ficheSoin.paginator = this.paginator;
  }

  validerCode() {
    const code = this.codeForm.get('code')?.value;
    switch (code) {
      case '1111':
        this.roleAcces = 'Medecin';
        this.codeInvalide = false;
        break;
      case '2222':
        this.roleAcces = 'Radiologue';
        this.codeInvalide = false;
        break;
      case '3333':
        this.roleAcces = 'Analyste';
        this.codeInvalide = false;
        break;
        default:
          this.roleAcces = 'none';
          this.codeInvalide = true;
          setTimeout(() => {
            this.codeInvalide = false;
          }, 3000);
          break;
    }
  }

  loadPatients(patientIdFromUrl?: string) {
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

                      if (patientData.id === patientIdFromUrl) {
                        this.voirDossier(patientData, false);
                      }
                    }
                  }
                });
            }
          });
      });
    });
  }

  applyFilters() {
    this.dataSource = this.dataSourceOriginal.filter(patient => {
      const lowerFilterValue = this.filterValue.toLowerCase();
      return (
        patient.fullName.toLowerCase().includes(lowerFilterValue) ||
        patient.numero.toString().includes(lowerFilterValue) ||
        (patient.dateCreation && patient.dateCreation.includes(lowerFilterValue))
      );
    });
    this.applyPagination(this.dataSource);
  }

  pageEvent(event: any) {
    this.currentPage = event.pageIndex;
    this.applyPagination(this.dataSource);
  }

  applyPagination(filteredData: PatientData[]) {
    const startIndex = this.currentPage * 10;
    const endIndex = startIndex + 10;
    this.dataSource = filteredData.slice(startIndex, endIndex);
  }

  voirDossier(patient: PatientData, updateUrl: boolean = true): void {
    this.selectedPatient = patient;
    this.ficheSoin.data = [];
    this.images = [];
    this.analyses = [];

    // Met à jour l'URL avec l'ID du patient sélectionné
    if (updateUrl) {
      this.router.navigate(['/dossier-details', patient.id]);
    }

    // Récupère les données du dossier du patient (comme avant)
    this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(patient.id))
      .snapshotChanges()
      .subscribe(dossiers => {
        if (dossiers.length > 0) {
          const dossierKey = dossiers[0].key!;

          this.db.list('fichesSoin', ref => ref.orderByChild('dossierId').equalTo(dossierKey))
            .snapshotChanges()
            .subscribe(data => {
              this.ficheSoin.data = data.map(action => {
                const fiche = action.payload.val() as any;
                fiche.id = action.key;
                return fiche;
              });
              this.ficheSoin.paginator = this.paginator;
            });

          this.db.list('imagesMedicales', ref => ref.orderByChild('dossierId').equalTo(dossierKey))
            .valueChanges()
            .subscribe(data => {
              this.images = data;
            });

          this.db.list('analysesMedicales', ref => ref.orderByChild('dossierId').equalTo(dossierKey))
            .valueChanges()
            .subscribe(data => {
              this.analyses = data;
            });
        }
      });
  }

  selectPatient(patient: PatientData) {
    // Change l'ID du patient sélectionné
    this.selectedPatient = patient;

    // Appelle voirDossier pour afficher les détails du patient et mettre à jour l'URL
    this.voirDossier(patient, true); // Mettre à jour l'URL
  }


  openImageModal(image: any) {
    this.selectedImage = image;
    this.isImageModalOpen = true;
  }

  closeImageModal() {
    this.isImageModalOpen = false;
  }

  openAnalyseModal(analyse: any) {
    this.selectedAnalyse = analyse;
    this.isAnalyseModalOpen = true;
  }

  closeAnalyseModal() {
    this.isAnalyseModalOpen = false;
  }

  voirFiche(fiche: any) {
    this.selectedFiche = fiche;
    this.isFicheModalOpen = true;
    console.log(fiche);
    const id:string=fiche.id;
    console.log(id);

    this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(id))
      .valueChanges()
      .subscribe(lignes => {
        this.selectedFiche.lignes = lignes;
      });

  }

  closeFicheModal() {
    this.isFicheModalOpen = false;
  }

  formatPatientNumero(num: number): string {
    const prefix = '2025';
    const numStr = num.toString();
    const zerosNeeded = 9 - prefix.length - numStr.length;
    const zeroPadding = '0'.repeat(Math.max(0, zerosNeeded));
    return `${prefix}${zeroPadding}${numStr}`;
  }
}
