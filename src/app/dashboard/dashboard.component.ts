import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
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
  dataSource = new MatTableDataSource<PatientData>();
  allPatients: PatientData[] = [];
  pagedPatients: PatientData[] = [];

  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private db: AngularFireDatabase, private router: Router) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

    this.paginator.page.subscribe(() => {
      this.updatePagedPatients();
    });
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

                    const exists = this.allPatients.find(p => p.id === patientData.id);
                    if (!exists) {
                      this.allPatients.push(patientData);
                      this.dataSource.data = this.allPatients;
                      this.applyFilters(); // Appliquer le filtre initial
                    }
                  }
                });
            }
          });
      });
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    const filtered = this.allPatients.filter(patient => {
      return (
        patient.fullName.toLowerCase().includes(term) ||
        patient.numero.toString().includes(term) ||
        new Date(patient.dateCreation).toISOString().slice(0, 10).includes(term)
      );
    });

    this.dataSource.data = filtered;
    this.paginator.firstPage(); // revenir à la première page
    this.updatePagedPatients();
  }

  updatePagedPatients() {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    this.pagedPatients = this.dataSource.data.slice(startIndex, endIndex);
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