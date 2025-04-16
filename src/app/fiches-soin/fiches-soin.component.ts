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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-fiches-soin',
  templateUrl: './fiches-soin.component.html',
  styleUrls: ['./fiches-soin.component.css']
})
export class FichesSoinComponent implements OnInit, OnDestroy {
  ficheId: string = '';
  ficheSoin: any[] = [];
  lignesFicheSoin: any[] = [];
  numeroDossier: string = '';
  fichesSoin: any[] = []; // Toutes les fiches (copie complète)
  fichesSoinFiltrees: any[] = []; // Fiches après filtrage

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
          console.log('Lignes de la fiche de soin récupérées :', this.lignesFicheSoin);

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
            this.fichesSoinFiltrees = [...this.fichesSoin];
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
    this.pagedFichesSoin = this.fichesSoinFiltrees.slice(startIndex, endIndex);
  }


  filtrerFichesSoin(): void {
    const { dateDebut, nomAgent } = this.filtreForm.value;

    this.fichesSoinFiltrees = this.fichesSoin.filter(fiche => {
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



  telechargerDonneesFiche(fiche: any): void {
    // console.log('Fiche ID:', ficheId);
    const IdFicheSoins: any[] = []; // Initialisation du tableau

    // Récupérer toutes les lignes depuis le localStorage
    const allLignesRaw = localStorage.getItem('lignesFichesSoin');
    const allLignes = JSON.parse(allLignesRaw || '{}'); // c’est un objet, pas un tableau
    
    console.log('Toutes les lignes récupérées:', allLignes);
    console.log('Fiche ID à chercher:', fiche.id);
    
    
    
    let soinsTrouvés: any[] = [];

    // Parcours des sections (fs002, fs003, etc.)
    for (const sectionKey in allLignes) {
      if (sectionKey === fiche.id) {
        const sousObjets = allLignes[sectionKey]; // Ex: { lfs202: {...}, lfs203: {...} }
        console.log('Sous-objets trouvés:', sousObjets);
    
        // Convertir les sous-objets en tableau de soins
        soinsTrouvés = Object.values(sousObjets); // [ { contenu, dateAjout, nom }, ... ]
        break;
      }
    }

  
  
    // Ensuite tu peux garder le reste de ta logique PDF (déjà prête)
    const patientDataRaw = localStorage.getItem('patientData');
    const patientData = patientDataRaw ? JSON.parse(patientDataRaw) : [];

    // Créer le PDF après avoir récupéré les données
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [63, 81, 181];
    let y = 20;
    const lineHeight = 8;

    // Logo + Titre
    const logo = new Image();
    logo.src = "../../assets/images/logo (2).png";

    logo.onload = () => {
      doc.addImage(logo, 'PNG', 10, 10, 40, 15);

      doc.setFontSize(18);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`FICHE DE SOIN N° ${fiche.numero}`, pageWidth / 2, y, { align: 'center' });

      y += 20;

      // Section: Informations personnelles
      doc.setFillColor(...primaryColor);
      doc.rect(10, y, pageWidth - 20, 8, 'F');
      doc.setTextColor(255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const text = 'INFORMATIONS PERSONNELLES';
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y + 6);

      y += 12;
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      y += 5;

      const infos = [
        `NOM ET PRENOM: ${patientData.lastName?.toUpperCase()} ${patientData.firstName?.toUpperCase() || ''}`,
        `CIN: ${patientData.cin}`,
        `DATE DE NAISSANCE: ${patientData.dateNaissance}`,
        `EMAIL: ${patientData.email}`,
        `SEXE: ${patientData.sexe}`,
        `ADRESSE: ${patientData.adresse}`,
        `TELEPHONE: ${patientData.phone}`
      ];

      const leftX = 14;
      const rightX = pageWidth / 2 + 5;

      for (let i = 0; i < infos.length; i += 2) {
        doc.text(infos[i], leftX, y);
        if (i + 1 < infos.length) {
          doc.text(infos[i + 1], rightX, y);
        }
        y += lineHeight;
      }

      y += 4;

      // Section: Médecin
      doc.setFillColor(...primaryColor);
      doc.rect(10, y, pageWidth - 20, 8, 'F');
      doc.setTextColor(255);
      doc.setFontSize(11);
      const text1 = 'DÉTAILS DU MÉDECIN';
      const textWidth1 = doc.getTextWidth(text1);
      const x1 = (pageWidth - textWidth1) / 2;
      doc.text(text1, x1, y + 6);

      y += 12;
      doc.setTextColor(0);
      doc.setFontSize(10);
      y += 5;

      doc.text(`AGENT CRÉATEUR: ${fiche.agentCreateur}`, 12, y);
      doc.text(`ADRESSE CRÉATEUR: ${fiche.adresseCreateur}`, pageWidth / 2, y);
      y += lineHeight;
      doc.text(`DATE DE CRÉATION: ${fiche.dateCreation}`, 12, y);
      y += lineHeight + 4;

      // Section: Fiche de soins
      doc.setFillColor(...primaryColor);
      doc.rect(10, y, pageWidth - 20, 8, 'F');
      doc.setTextColor(255);
      doc.setFontSize(11);
      const text2 = 'SOINS MÉDICAUX';
      const textWidth2 = doc.getTextWidth(text2);
      const x2 = (pageWidth - textWidth2) / 2;
      doc.text(text2, x2, y + 6);
      y += 10;
      y += 10;

      const body = soinsTrouvés.map((soin: any) => [
        new Date(soin.dateAjout).toLocaleDateString(),
        soin.nom || 'N/A',
        soin.contenu || 'N/A'
      ]);
      // Ajouter les données de la fiche de soins au tableau
      autoTable(doc, {
        startY: y,
        head: [['DATE', 'TRAITEMENT', 'DESCRIPTION']],
        body: body,
        
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold',
        }
      });

      y = (doc as any).lastAutoTable.finalY + 8;

      // Vérifier si l'agent créateur est "Sfax Medina"
      if (fiche.agentCreateur === "Sfax Medina") {
        const logoAgent = new Image();
        logoAgent.src = "../../assets/images/clinic1.png"; // Remplacer par le chemin de votre logo
        logoAgent.onload = () => {
          const logoX = pageWidth - 50; // Position X pour placer le logo à droite
          const logoY = 5;
          doc.addImage(logoAgent, 'PNG', logoX, logoY, 40, 30); // Ajuster la taille et la position
          doc.save(`Fiche-${fiche.numero}.pdf`);
        };
      } else {
        doc.save(`Fiche-${fiche.numero}.pdf`);
      }
    };
  }





}
