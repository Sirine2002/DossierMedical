import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { FicheSoinDetailsComponent } from '../fiche-soin-details/fiche-soin-details.component';
import { FicheSoinService } from 'src/Services/fiche-soin.service';

@Component({
  selector: 'app-fiches-soin',
  templateUrl: './fiches-soin.component.html',
  styleUrls: ['./fiches-soin.component.css']
})
export class FichesSoinComponent implements OnInit, OnDestroy {
  ficheId: string = '';
  lignesFicheSoin: any[] = [];
  numeroDossier: string = '';
  fichesSoin: any[] = [];
  pagedFichesSoin: any[] = [];
  pageSize: number = 4; // Nombre de fiches par page
  pageIndex: number = 0; // Page courante
  filtreForm: FormGroup;
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private auth: AngularFireAuth,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private location: Location,
    private ficheSoinService: FicheSoinService // Injecter le service
  ) {
    this.filtreForm = this.fb.group({
      dateDebut: [''],
      nomAgent: ['']
    });
  }

  ngOnInit(): void {
    this.ficheId = this.ficheSoinService.getFicheId();
    if (this.ficheId) {
      // Charger les lignes de la fiche de soin associée à cette ficheId
      this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(this.ficheId))
        .snapshotChanges()
        .subscribe(lignes => {
          this.lignesFicheSoin = lignes.map(d => ({
            key: d.key,
            ...d.payload.val() as any
          }));
          console.log('Lignes de la fiche de soin récupérées :', this.lignesFicheSoin); // Ajout temporaire pour déboguer
        }, error => {
          console.error('Erreur lors de la récupération des lignes de la fiche de soin:', error);
        });
    }

    this.numeroDossier = this.route.snapshot.paramMap.get('numero') || '';

    this.auth.authState.subscribe(user => {
      if (user) {
        const userId = user.uid;
        this.loadFichesDuPatient(userId);
      }
    });

    // Appliquer les filtres si nécessaire
    this.filtreForm.valueChanges.subscribe(() => {
      this.filtrerFichesSoin();
    });
  }

  loadFichesDuPatient(userId: string): void {
    const dossiersSub = this.db.list('dossier', ref =>
      ref.orderByChild('patientId').equalTo(userId))
      .snapshotChanges()
      .subscribe(dossiers => {
        const dossierIds = dossiers.map(d => d.key);

        if (dossierIds.length === 0) {
          this.fichesSoin = [];
          return;
        }

        const fichesSub = this.db.list('fichesSoin', ref =>
          ref.orderByChild('dossierId').equalTo(dossierIds[0]))  // Vous pouvez adapter la condition si nécessaire
          .snapshotChanges()
          .subscribe(fiches => {
            const toutesFiches = fiches.map(f => {
              const data = f.payload.val() as any;
              const id = f.key;
              return { id, ...data };
            });

            this.fichesSoin = toutesFiches;
            this.updatePagedFiches();
          });

        this.subscription.add(fichesSub);
      });

    this.subscription.add(dossiersSub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updatePagedFiches() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedFichesSoin = this.fichesSoin.slice(startIndex, endIndex);
  }

  filtrerFichesSoin(): void {
    const { dateDebut, nomAgent } = this.filtreForm.value;

    this.fichesSoin = this.fichesSoin.filter(fiche => {
      let match = true;

      if (dateDebut) {
        const selectedDate = new Date(dateDebut);
        selectedDate.setHours(0, 0, 0, 0);
        const ficheDate = new Date(fiche.dateCreation);
        ficheDate.setHours(0, 0, 0, 0);
        match = match && ficheDate.getTime() === selectedDate.getTime();
      }

      if (nomAgent) {
        match = match && fiche.agentCreateur?.toString().toLowerCase().includes(nomAgent.toLowerCase());
      }

      return match;
    });

    this.updatePagedFiches();
  }

  onPageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedFiches();
  }

  voirImage(imageUrl: string) {
    window.open(imageUrl, '_blank');
  }

  voirPlus(ficheSoin: any): void {
    this.dialog.open(FicheSoinDetailsComponent, {
      data: ficheSoin,
      width: '60%',
    });
  }

  retour(): void {
    this.location.back();
  }
}
