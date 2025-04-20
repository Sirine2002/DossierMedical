import { Component, Inject } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false); // Retourne false si l'utilisateur annule
  }

  onConfirm(): void {
    this.dialogRef.close(true); // Retourne true si l'utilisateur confirme
  }
}