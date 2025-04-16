import { Component, Inject, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FicheSoinService } from 'src/Services/fiche-soin.service';

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
    private auth: AngularFireAuth,
    private ficheSoinService: FicheSoinService // Injecter le service
  ) {
    
    console.log('DATA INJECTED :', this.data);
   

    this.ficheId = this.data.id;
    
  }

  ngOnInit(): void {
    // this.ficheSoinService.setFicheId(this.ficheId);
    this.auth.authState.subscribe(user => {
      if (user) {
        
        this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(this.ficheId))
          .snapshotChanges()
          .subscribe(lignes => {
            this.ficheSoin = lignes.map(d => ({
              key: d.key,
              ...d.payload.val() as any
            }));
            localStorage.setItem('LigneficheSoin', JSON.stringify(this.ficheSoin));
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
    // localStorage.removeItem('LigneficheSoin'); // Ajout temporaire pour déboguer
  }

  
}
