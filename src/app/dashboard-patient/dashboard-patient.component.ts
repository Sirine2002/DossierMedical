import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, signal, ViewChild, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSort } from '@angular/material/sort';
import { FicheSoinDetailsComponent } from '../fiche-soin-details/fiche-soin-details.component';
import { MatDialog } from '@angular/material/dialog';
import { VoirPlusComponent } from '../voir-plus/voir-plus.component';
import { FormBuilder, FormGroup } from '@angular/forms';

interface DossierComplet {
  dossier: any;
  ficheSoin: any[];
  imageMedicale: any[];
  analyseMedicale: any[];
}

@Component({
  selector: 'app-dashboard-patient',
  templateUrl: './dashboard-patient.component.html',
  styleUrls: ['./dashboard-patient.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPatientComponent implements OnInit, AfterViewInit {
  readonly panelOpenState = signal(false);
  tabLoadTimes: Date[] = [];

  displayedColumns1: string[] = ['numero', 'agentCreateur', 'adresseCreateur', 'dateCreation', 'Actions'];
  displayedColumns2: string[] = ['numero', 'image', 'agentCreateur', 'adresseCreateur', 'dateCreation', 'Actions'];
  displayedColumns3: string[] = ['numero', 'fichier', 'agentCreateur', 'adresseCreateur', 'dateCreation', 'Actions'];

  filtreForm: FormGroup;
  dossiersComplets: DossierComplet[] = [];
  dossiersFiltres: DossierComplet[] = [];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private db: AngularFireDatabase,
    private auth: AngularFireAuth,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.filtreForm = this.fb.group({
      dateDebut: [null],
      numero: [''],
      etat: ['']
    });
  }

  ngOnInit(): void {
    this.auth.authState.subscribe(user => {
      if (user) {
        const userId = user.uid;

        this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(userId))
          .snapshotChanges()
          .subscribe(dossiers => {
            this.dossiersComplets = []; // Réinitialiser

            dossiers.forEach(d => {
              const dossierData = { ...(d.payload.val() as any), key: d.key };

              const dossierComplet: DossierComplet = {
                dossier: dossierData,
                ficheSoin: [],
                imageMedicale: [],
                analyseMedicale: []
              };

              // 🔹 Fiches de soin
              this.db.list('fichesSoin', ref => ref.orderByChild('dossierId').equalTo(dossierData.key))
                .snapshotChanges()
                .subscribe(data => {
                  dossierComplet.ficheSoin = data.map(item => ({
                    key: item.key,
                    ...(item.payload.val() as any)
                  }));
                  this.cdr.detectChanges();
                });

              // 🔹 Images médicales
              this.db.list('imagesMedicales', ref => ref.orderByChild('dossierId').equalTo(dossierData.key))
                .snapshotChanges()
                .subscribe(data => {
                  dossierComplet.imageMedicale = data.map(item => ({
                    key: item.key,
                    type: 'image',
                    ...(item.payload.val() as any)
                  }));
                  this.cdr.detectChanges();
                });

              // 🔹 Analyses médicales
              this.db.list('analysesMedicales', ref => ref.orderByChild('dossierId').equalTo(dossierData.key))
                .snapshotChanges()
                .subscribe(data => {
                  dossierComplet.analyseMedicale = data.map(item => ({
                    key: item.key,
                    type: 'analyse',
                    ...(item.payload.val() as any)
                  }));
                  this.cdr.detectChanges();
                });

              this.dossiersComplets.push(dossierComplet);
              this.dossiersFiltres = [...this.dossiersComplets];
              this.cdr.detectChanges();
            });

            this.filtreForm.valueChanges.subscribe(() => {
              this.filtrerDossiers();
            });
          });
      }
    });
  }

  filtrerDossiers(): void {
    const { dateDebut, numero, etat } = this.filtreForm.value;

    this.dossiersFiltres = this.dossiersComplets.filter(dossier => {
      let match = true;

      if (dateDebut) {
        const selectedDate = new Date(dateDebut);
        selectedDate.setHours(0, 0, 0, 0);
        const dossierDate = new Date(dossier.dossier.dateCreation);
        dossierDate.setHours(0, 0, 0, 0);
        match = match && dossierDate.getTime() === selectedDate.getTime();
      }

      if (numero) {
        match = match && dossier.dossier.numero?.toString().includes(numero.toString());
      }

      if (etat) {
        match = match && dossier.dossier.etat?.toLowerCase() === etat.toLowerCase();
      }

      return match;
    });
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    // Sorting logique si besoin
  }

  getTimeLoaded(index: number) {
    if (!this.tabLoadTimes[index]) {
      this.tabLoadTimes[index] = new Date();
    }
    return this.tabLoadTimes[index];
  }

  formatNumero(numero: number): string {
    return numero.toString().padStart(8, '0');
  }

  imprimer(row: any) {
    console.log('Impression :', row);
    // logique d'impression ici
  }

  voirPlus(ficheSoin: any): void {
    this.dialog.open(FicheSoinDetailsComponent, {
      data: ficheSoin,
      width: '60%',
    });
  }

  voirPlusAutre(autre: any): void {
    this.dialog.open(VoirPlusComponent, {
      data: autre,
      width: '50%',
    });
  }
}