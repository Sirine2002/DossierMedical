import { Component, Inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-voir-plus',
  templateUrl: './voir-plus.component.html',
  styleUrls: ['./voir-plus.component.css']
})
export class VoirPlusComponent {
  type: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<VoirPlusComponent>,
  ) {
    console.log('DATA INJECTED :', this.data); // Ajout temporaire pour déboguer

    this.type = data.type; // Récupère l'ID de la fiche de soin depuis les données injectées
  }


  formatNumero(numero: number): string {
    return numero.toString().padStart(8, '0');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
