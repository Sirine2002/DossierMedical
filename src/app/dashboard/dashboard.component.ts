import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

interface PatientData {
  id: string;
  fullName: string;
  dateNaissance: string;
  phone: string;
  email: string;
  sexe: string;
  adresse: string;
  dateCreation: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
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
  userrole:string | null=localStorage.getItem('userRole');

  displayedColumns: string[] = ['numero', 'dateCreation', 'agentCreateur', 'adresseCreateur', 'actions'];
  displayedColumns1: string[] = ['nom', 'type', 'dateAjout', 'contenu'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  roleAcces: 'none' | 'Medecin' | 'Radiologue' | 'Analyste' = 'none';
  codeForm = new FormGroup({
    code: new FormControl('', Validators.required)
  });

  constructor(private db: AngularFireDatabase) {
    this.loadPatients();
  }

  ngAfterViewInit(): void {
    this.ficheSoin.paginator = this.paginator;
  }

  validerCode() {
    const code = this.codeForm.get('code')?.value;

    switch (code) {
      case '1111' :
        this.roleAcces = 'Medecin';
        break;
      case '2222':
        this.roleAcces = 'Radiologue';
        break;
      case '3333':
        this.roleAcces = 'Analyste';
        break;
      default:
        this.roleAcces = 'none';
        //alert("Code invalide !");
    }
  }

  ajouterFiche() {
    console.log('Ajouter une fiche');
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
                    };
                    if (!this.dataSource.find(p => p.id === patientData.id)) {
                      this.dataSource.push(patientData);
                    }
                  }
                });
            }
          });
      });
    });
  }

  voirDossier(patient: PatientData): void {
    this.selectedPatient = patient;
    this.ficheSoin.data = [];
    this.images = [];
    this.analyses = [];

    this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(patient.id))
      .snapshotChanges()
      .subscribe(dossiers => {
        if (dossiers.length > 0) {
          const dossierKey = dossiers[0].key!;
          console.log(dossierKey);

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

    this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(fiche.id))
      .valueChanges()
      .subscribe(lignes => {
        this.selectedFiche.lignes = lignes;
      });
  }

  closeFicheModal() {
    this.isFicheModalOpen = false;
  }
}