import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FicheSoinService } from 'src/Services/fiche-soin.service';

@Component({
  selector: 'app-fiche-soin-details',
  templateUrl: './fiche-soin-details.component.html',
  styleUrls: ['./fiche-soin-details.component.css']
})
export class FicheSoinDetailsComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'type', 'contenu', 'dateAjout'];
  dataSource = new MatTableDataSource<any>();
  ficheId: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FicheSoinDetailsComponent>,
    private db: AngularFireDatabase,
    private auth: AngularFireAuth,
    private ficheSoinService: FicheSoinService
  ) {
    console.log('DATA INJECTED :', this.data);
    this.ficheId = this.data.id;
  }

  ngOnInit(): void {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(this.ficheId))
          .snapshotChanges()
          .subscribe(lignes => {
            const fiches = lignes.map(d => ({
              key: d.key,
              ...d.payload.val() as any
            }));
            this.dataSource = new MatTableDataSource(fiches);
            this.dataSource.paginator = this.paginator;
          }, error => {
            console.error('Erreur lors de la récupération des lignes :', error);
          });
      }
    });
  }

  formatNumero(numero: number): string {
    return numero.toString().padStart(8, '0');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
