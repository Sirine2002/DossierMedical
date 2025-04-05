import { Component, Inject, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-fiche-soin-details',
  templateUrl: './fiche-soin-details.component.html',
  styleUrls: ['./fiche-soin-details.component.css']
})
export class FicheSoinDetailsComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'type', 'contenu', 'dateAjout'];
  ficheSoin: any[] = [];
  ficheId: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FicheSoinDetailsComponent>,
    private db: AngularFireDatabase,
    private auth: AngularFireAuth
  ) {
    console.log('DATA INJECTED :', this.data); // Ajout temporaire pour déboguer

    this.ficheId = data.key; // Récupère l'ID de la fiche de soin depuis les données injectées
  }

  ngOnInit(): void {
    this.auth.authState.subscribe(user => {
      if (user) {
        console.log(this.ficheId);
        this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(this.ficheId))
          .snapshotChanges()
          .subscribe(lignes => {
            this.ficheSoin = lignes.map(d => ({
              key: d.key,
              ...d.payload.val() as any
            }));
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
