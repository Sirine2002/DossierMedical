import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';

export interface PatientData {
  id: string;
  cin: string;
  fullName: string;
  dateNaissance: string;
  phone: string;
  email: string;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  displayedColumns: string[] = ['cin', 'fullName', 'dateNaissance', 'phone', 'email', 'actions'];
  dataSource: MatTableDataSource<PatientData> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private db: AngularFireDatabase, private router:Router) {
    this.loadPatients();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadPatients() {
    this.db.list('users').snapshotChanges().subscribe(users => {
      const patientsUsers = users.filter(user => (user.payload.val() as any).role === 'Patient');
      const patientsData: PatientData[] = [];

      patientsUsers.forEach(user => {
        const userId = user.key!;
        const userInfo = user.payload.val() as any;

        this.db.list('patients', ref => ref.orderByChild('utilisateurId').equalTo(userId))
          .valueChanges()
          .subscribe(patients => {
            if (patients.length > 0) {
              const patientInfo = patients[0] as any;
              patientsData.push({
                id: userId,
                cin: userInfo.cin,
                fullName: `${userInfo.firstName} ${userInfo.lastName}`,
                dateNaissance: patientInfo.dateNaissance,
                phone: userInfo.phone,
                email: userInfo.email
              });

              this.dataSource.data = patientsData;
            }
          });
      });
    });
  }
  voirDossier(patient: PatientData) {
    this.router.navigate(['/dossiers', patient.fullName], {
      state: { patient }
    });
  }
}