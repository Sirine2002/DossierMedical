import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, signal, ViewChild, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSort } from '@angular/material/sort';
import { FicheSoinDetailsComponent } from '../fiche-soin-details/fiche-soin-details.component';
import { MatDialog } from '@angular/material/dialog';
import { VoirPlusComponent } from '../voir-plus/voir-plus.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.filtreForm = this.fb.group({
      date: [null],
      numero: [''],
      typeFichier: [''],
      nomAgent: ['']
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
                    id: item.key,
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
    const {
      date,
      numero,
      nomAgent,
      typeFichier
    } = this.filtreForm.value;
  
    this.dossiersFiltres = this.dossiersComplets.filter(dossier => {
      let match = true;
  
      if (numero) {
        match = match && dossier.dossier.numero?.toString().includes(numero.toString());
      }
  
      if (nomAgent) {
        match = match && dossier.dossier.agentCreateur?.toString().toLowerCase().includes(nomAgent.toLowerCase());
      }
  
      // Si une date est choisie, filtrer tous les types d'éléments par cette date
      if (date) {
        const selected = new Date(date);
        selected.setHours(0, 0, 0, 0);
  
        const ficheMatch = dossier.ficheSoin.some(fiche => {
          const d = new Date(fiche.dateCreation);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === selected.getTime();
        });
  
        const imageMatch = dossier.imageMedicale.some(img => {
          const d = new Date(img.dateCreation);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === selected.getTime();
        });
  
        const analyseMatch = dossier.analyseMedicale.some(ana => {
          const d = new Date(ana.dateCreation);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === selected.getTime();
        });
  
        match = match && (ficheMatch || imageMatch || analyseMatch);
      }
  
      // Optionnel : filtrage par type de fichier
      if (typeFichier) {
        if (typeFichier === 'fiche_soin') {
          match = match && dossier.ficheSoin.length > 0;
        } else if (typeFichier === 'image') {
          match = match && dossier.imageMedicale.length > 0;
        } else if (typeFichier === 'analyse') {
          match = match && dossier.analyseMedicale.length > 0;
        }
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
  voirFiches(dossier: any) {
    this.router.navigate(['/fiches-soin', dossier.dossier.numero]);
  }
  
  voirImages(dossier: any) {
    this.router.navigate(['/images-medicales', dossier.dossier.numero]);
  }
  
  voirAnalyses(dossier: any) {
    this.router.navigate(['/analyses-medicales', dossier.dossier.numero]);
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


voirImage(imageUrl: string) {
  window.open(imageUrl, '_blank');
}

  
}