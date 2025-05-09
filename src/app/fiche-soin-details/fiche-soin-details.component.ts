// fiche-soin-details.component.ts

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FicheService } from 'src/Services/fiche.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
    private FicheService: FicheService,
    private auth: AngularFireAuth
  ) {
    console.log('DATA INJECTED :', this.data);
    this.ficheId = this.data.id;
  }

  ngOnInit(): void {
    // On ne gère plus l'authentification ici si elle n'est pas nécessaire pour la récupération des lignes
    this.FicheService.getLignesFicheSoin(this.ficheId).subscribe(lignes => {
      this.dataSource.data = lignes;  // Mettre à jour la source des données

      // Vérifier que le paginator est bien défini avant de l'utiliser
      setTimeout(() => {
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;  // Ajouter le paginator
        }
      });
    }, error => {
      console.error('Erreur lors de la récupération des lignes :', error);
    });
  }

  formatNumero(numero: number): string {
    return numero.toString().padStart(8, '0');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
