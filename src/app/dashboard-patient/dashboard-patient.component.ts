import { AfterViewInit, ChangeDetectionStrategy, Component, signal, ViewChild, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSort } from '@angular/material/sort';
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


  @ViewChild(MatSort) sort!: MatSort;

  dossiersComplet: DossierComplet[] = [];

  constructor(private db: AngularFireDatabase, private auth: AngularFireAuth) {}

  ngOnInit(): void {
    this.auth.authState.subscribe(user => {
      if (user) {
        const userId = user.uid;

        // 1. Charger les dossiers de l'utilisateur connecté
        this.db.list('dossier', ref => ref.orderByChild('userId').equalTo(userId))
          .snapshotChanges()
          .subscribe(dossiers => {
            dossiers.forEach(d => {
              const dossierData = { ...(d.payload.val() as any), key: d.key };
              console.log(dossierData)

              // 2. Pour chaque dossier, charger les listes liées
              const dossierComplet: DossierComplet = {
                dossier: dossierData,
                ficheSoin: [],
                imageMedicale: [],
                analyseMedicale: []
              };

              // Fiche de soin
              this.db.list('fichesSoin', ref => ref.orderByChild('dossierId').equalTo(dossierData.key))
                .valueChanges()
                .subscribe(data => {
                  dossierComplet.ficheSoin = data;
                });

              // Images médicales
              this.db.list('imagesMedicale', ref => ref.orderByChild('dossierId').equalTo(dossierData.key))
                .valueChanges()
                .subscribe(data => {
                  dossierComplet.imageMedicale = data;
                });

              // Analyses médicales
              this.db.list('analysesMedicale', ref => ref.orderByChild('dossierId').equalTo(dossierData.key))
                .valueChanges()
                .subscribe(data => {
                  dossierComplet.analyseMedicale = data;
                });

              this.dossiersComplet.push(dossierComplet);
            });
          });
      }
    });
  }
  ngAfterViewInit() {
    // this.dataSourceFicheSoin.sort = this.sort;
    // this.dataSourceImageMedicale.sort = this.sort;
    // this.dataSourceAnalyseMedicale.sort = this.sort;
  }

  getTimeLoaded(index: number) {
    if (!this.tabLoadTimes[index]) {
      this.tabLoadTimes[index] = new Date();
    }
    return this.tabLoadTimes[index];
  }
}