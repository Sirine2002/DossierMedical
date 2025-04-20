import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { AddFicheComponent } from '../add-fiche/add-fiche.component';
import { AddImageComponent } from '../add-image/add-image.component';
import { EditImageComponent } from '../edit-image/edit-image.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AddAnalyseComponent } from '../add-analyse/add-analyse.component';
import { EditAnalyseComponent } from '../edit-analyse/edit-analyse.component';
import { take } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EditFicheComponent } from '../edit-fiche/edit-fiche.component';

interface PatientData {
  id: string;
  fullName: string;
  dateNaissance: string;
  cin: string;
  phone: string;
  email: string;
  sexe: string;
  adresse: string;
  dateCreation: string;
  numero: number;
}

@Component({
  selector: 'app-dossier-details',
  templateUrl: './dossier-details.component.html',
  styleUrls: ['./dossier-details.component.css']
})
export class DossierDetailsComponent implements OnInit {
  patient: any;
  dataSourceOriginal: PatientData[] = [];
  dataSourceOriginal2: any[] = [];
  dataSource: PatientData[] = [];
  selectedPatient?: PatientData;

  ficheSoin = new MatTableDataSource<any>();
  images: any[] = [];
  analyses: any[] = [];
  ficheSoins: any[] = [];

  hoverImage: boolean = false;
  selectedAnalyse: any = null;
  isAnalyseModalOpen: boolean = false;
  selectedImage: any = null;
  isImageModalOpen: boolean = false;
  isFicheModalOpen: boolean = false;
  selectedFiche: any = null;
  showFilters: boolean = false;
  userrole: string | null = localStorage.getItem('userRole');
  codeInvalide: boolean = false;

  filterValue: string = '';
  errorMessage: string = '';
  displayedColumns: string[] = ['numero', 'dateCreation', 'agentCreateur', 'adresseCreateur', 'actions'];
  displayedColumns1: string[] = ['nom', 'type', 'dateAjout', 'contenu'];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  roleAcces: 'none' | 'Medecin' | 'Radiologue' | 'Analyste' = 'none';

  codeForm = new FormGroup({
    code: new FormControl('', Validators.required)
  });

  currentPage: number = 0;

  constructor(
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const patientIdFromUrl = params.get('id');
      this.loadPatients(patientIdFromUrl!);
    });
  }

  ngAfterViewInit(): void {
    this.ficheSoin.paginator = this.paginator;
  }

  validerCode() {
    const code = this.codeForm.get('code')?.value;
    const role = this.userrole; // Supposons que vous ayez une fonction pour obtenir le rôle de l'utilisateur, par exemple via une variable ou un service.

    if (role === 'Medecin' && code === '1111') {
      this.roleAcces = 'Medecin';
      this.codeInvalide = false;
    } else if (role === 'Radiologue' && code === '2222') {
      this.roleAcces = 'Radiologue';
      this.codeInvalide = false;
    } else if (role === 'Analyste' && code === '3333') {
      this.roleAcces = 'Analyste';
      this.codeInvalide = false;
    } else {
      this.roleAcces = 'none';  // Code incorrect ou rôle incorrect
      this.codeInvalide = true;
      setTimeout(() => {
        this.codeInvalide = false;
      }, 3000);
    }

    // Si on atteint ce point, le code est correct pour le rôle
    console.log('Accès validé pour le rôle :', this.roleAcces);
  }



  loadPatients(patientIdFromUrl?: string) {
    this.db.list('users').snapshotChanges().subscribe(users => {
      const patientsUsers = users.filter(user => (user.payload.val() as any).role === 'Patient');
      patientsUsers.forEach(user => {
        const userId = user.key!;
        const userInfo = user.payload.val() as any;

        this.db.list('patients', ref => ref.orderByChild('utilisateurId').equalTo(userId))
          .valueChanges()
          .subscribe(patients => {
            if (patients.length > 0) {
              const patientInfo = patients[0] as any;

              this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(userId))
                .valueChanges()
                .subscribe(dossiers => {
                  if (dossiers.length > 0) {
                    const dossier = dossiers[0] as any;
                    const patientData: PatientData = {
                      id: userId,
                      fullName: `${userInfo.firstName} ${userInfo.lastName}`,
                      cin: userInfo.cin,
                      dateNaissance: patientInfo.dateNaissance,
                      phone: userInfo.phone,
                      email: userInfo.email,
                      sexe: patientInfo.sexe,
                      adresse: patientInfo.adresse,
                      dateCreation: dossier.dateCreation,
                      numero: dossier.numero,
                    };

                    const exists = this.dataSourceOriginal.find(p => p.id === patientData.id);
                    if (!exists) {
                      this.dataSourceOriginal.push(patientData);
                      this.applyFilters();

                      if (patientData.id === patientIdFromUrl) {
                        this.voirDossier(patientData, false);
                      }
                    }
                  }
                });
            }
          });
      });
    });
  }

  applyFilters() {
    this.dataSource = this.dataSourceOriginal.filter(patient => {
      const lowerFilterValue = this.filterValue.toLowerCase();
      return (
        patient.fullName.toLowerCase().includes(lowerFilterValue) ||
        patient.numero.toString().includes(lowerFilterValue) ||
        (patient.dateCreation && patient.dateCreation.includes(lowerFilterValue))
      );
    });
    this.applyPagination(this.dataSource);
  }

  pageEvent(event: any) {
    this.currentPage = event.pageIndex;
    this.applyPagination(this.dataSource);
  }

  applyPagination(filteredData: PatientData[]) {
    const startIndex = this.currentPage * 10;
    const endIndex = startIndex + 10;
    this.dataSource = filteredData.slice(startIndex, endIndex);
  }

  voirDossier(patient: PatientData, updateUrl: boolean = true): void {
    this.selectedPatient = patient;
    this.ficheSoin.data = [];
    this.images = [];
    this.analyses = [];

    // Met à jour l'URL avec l'ID du patient sélectionné
    if (updateUrl) {
      this.router.navigate(['/dossier-details', patient.id]);
    }

    // Récupère les données du dossier du patient (comme avant)
    this.db.list('dossier', ref => ref.orderByChild('patientId').equalTo(patient.id))
      .snapshotChanges()
      .subscribe(dossiers => {
        if (dossiers.length > 0) {
          const dossierKey = dossiers[0].key!;

          this.db.list('fichesSoin', ref => ref.orderByChild('dossierId').equalTo(dossierKey))
            .snapshotChanges()
            .subscribe(fiches => {
              this.ficheSoins = fiches.map(fiche => ({
                key: fiche.key,
                ...(fiche.payload.val() as any)
              }));
            });

          this.db.list('imagesMedicales', ref => ref.orderByChild('dossierId').equalTo(dossierKey))
            .snapshotChanges()
            .subscribe(images => {
              this.images = images.map(image => ({
                key: image.key,
                ...(image.payload.val() as any)
              }));
            });

          this.db.list('analysesMedicales', ref => ref.orderByChild('dossierId').equalTo(dossierKey))
            .snapshotChanges()
            .subscribe(data => {
              this.analyses = data.map(analyse => ({
                key: analyse.key,
                ...(analyse.payload.val() as any)
              }));
            });
        }
      });
  }

  selectPatient(patient: PatientData) {
    // Change l'ID du patient sélectionné
    this.selectedPatient = patient;

    // Appelle voirDossier pour afficher les détails du patient et mettre à jour l'URL
    this.voirDossier(patient, true); // Mettre à jour l'URL
  }


  openImageModal(image: any) {
    this.selectedImage = image;
    this.isImageModalOpen = true;
  }

  closeImageModal() {
    this.isImageModalOpen = false;
  }

  openAnalyseModal(analyse: any) {
    this.selectedAnalyse = analyse;
    this.isAnalyseModalOpen = true;
  }

  closeAnalyseModal() {
    this.isAnalyseModalOpen = false;
  }

  voirFiche(fiche: any) {
    this.selectedFiche = fiche;
    this.isFicheModalOpen = true;
    console.log(fiche);
    const id: string = fiche.key;
    console.log(id);

    this.db.list('lignesFicheSoin', ref => ref.orderByChild('ficheSoinId').equalTo(id))
      .valueChanges()
      .subscribe(lignes => {
        this.selectedFiche.lignes = lignes;
      });

  }

  closeFicheModal() {
    this.isFicheModalOpen = false;
  }

  formatPatientNumero(num: number): string {
    const prefix = '2025';
    const numStr = num.toString();
    const zerosNeeded = 9 - prefix.length - numStr.length;
    const zeroPadding = '0'.repeat(Math.max(0, zerosNeeded));
    return `${prefix}${zeroPadding}${numStr}`;
  }
  //Ajout Fiche Soin
  loadFicheSoins(): void {
    this.db.list('fichesSoin', ref =>
      ref.orderByChild('dossierId').equalTo(this.patient.id)
    )
      .snapshotChanges()
      .subscribe(ficheChanges => {
        const fiches = ficheChanges.map(c => ({
          id: c.payload.key,
          ...(c.payload.val() as any),
          lignes: []
        }));
  
        this.db.list('lignesFicheSoin')
          .snapshotChanges()
          .subscribe(ligneChanges => {
            const lignes = ligneChanges.map(c => ({
              id: c.payload.key,
              ...(c.payload.val() as any)
            }));
  
            const lignesParFiche: { [ficheId: string]: any[] } = {};
  
            fiches.forEach(fiche => {
              const lignesFiche = lignes.filter(ligne => ligne.FicheSoinId === fiche.id);
              fiche.lignes = lignesFiche;
              lignesParFiche[fiche.id] = lignesFiche;
            });
  
            this.ficheSoins = fiches;
            localStorage.setItem('lignesParFiche', JSON.stringify(lignesParFiche));
          });
      });
  }
  

  openAddFicheDialog(patientId: string): void {
    const dialogRef = this.dialog.open(AddFicheComponent, {
      disableClose: true,
      data: { patientId } // 👈 on passe l'id ici
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadFicheSoins();
      }
    });
  }
  openEditFiche(ficheKey: string, ficheData: any): void {
    const dialogRef = this.dialog.open(EditFicheComponent, {
      disableClose: true,
      data: {
        ficheKey: ficheKey, // la clé Firebase de l'image
        fiche: ficheData    // l'objet image (pour préremplir le formulaire)
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadImages();
      }
    });
  }

  deleteFiche(ficheKey: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Êtes-vous sûr de vouloir supprimer cette fiche de soin et ses lignes ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Étape 1 : Récupérer toutes les lignes liées à cette fiche (une seule fois)
        this.db.list('lignesFicheSoin').snapshotChanges().pipe(take(1)).subscribe(snapshots => {
          const suppressions: Promise<void>[] = [];

          snapshots.forEach(snapshot => {
            const ligneKey = snapshot.key;
            const ligneData = snapshot.payload.val() as any;

            // Vérifie que cette ligne appartient bien à la fiche
            if (ligneData && ligneData.ficheSoinId === ficheKey) {
              const suppression = this.db.object(`lignesFicheSoin/${ligneKey}`).remove()
                .then(() => console.log(`✔️ Ligne ${ligneKey} supprimée.`))
                .catch(err => console.error(`❌ Erreur suppression ligne ${ligneKey} :`, err));
              suppressions.push(suppression);
            }
          });

          // Étape 2 : Une fois toutes les lignes supprimées, supprimer la fiche
          Promise.all(suppressions).then(() => {
            this.db.object(`fichesSoin/${ficheKey}`).remove()
              .then(() => console.log('🗑️ Fiche supprimée avec succès.'))
              .catch(err => console.error('❌ Erreur lors de la suppression de la fiche :', err));
          });
        });
      }
    });
  }

  telechargerFichePDF(fiche: any, nomPatient: string): void {

    const allLignesString = localStorage.getItem("lignesParFiche");
    console.log('Lignes par fiche:', allLignesString);
    let soinsTrouves: any[] = [];

    try {
      if (allLignesString && fiche?.id) {
        const allLignes = JSON.parse(allLignesString);
        soinsTrouves = allLignes[fiche.id] || [];
        if (soinsTrouves.length === 0) {
          console.warn('Aucune ligne de soin trouvée pour cette fiche:', fiche.id);
        }
      }
    } catch (e) {
      console.error("Erreur de parsing des lignes de soin :", e);
    }
    const patientData = this.selectedPatient;

    if (!patientData) {
      console.error("Aucun patient sélectionné");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor: [number, number, number] = [63, 81, 181];
    let y = 20;
    const lineHeight = 8;

    const logo = new Image();
    logo.src = "../../assets/images/logo (2).png";

    logo.onload = () => {
      doc.addImage(logo, 'PNG', 10, 10, 40, 15);
      doc.setFontSize(18);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`FICHE DE SOIN N° ${fiche.numero}`, pageWidth / 2, y, { align: 'center' });

      y += 20;

      // Informations personnelles
      doc.setFillColor(...primaryColor);
      doc.rect(10, y, pageWidth - 20, 8, 'F');
      doc.setTextColor(255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const text = 'INFORMATIONS PERSONNELLES';
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, y + 6);

      y += 12;
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      y += 5;

      const leftX = 14;
      const rightX = pageWidth / 2 + 5;

      const infoPairs = [
        { label: 'NOM ET PRENOM:', value: patientData.fullName?.toUpperCase() || 'N/A' },
        { label: 'CIN:', value: patientData.cin || 'N/A' },
        { label: 'DATE DE NAISSANCE:', value: patientData.dateNaissance || 'N/A' },
        { label: 'EMAIL:', value: patientData.email || 'N/A' },
        { label: 'SEXE:', value: patientData.sexe || 'N/A' },
        { label: 'ADRESSE:', value: patientData.adresse || 'N/A' },
        { label: 'TELEPHONE:', value: patientData.phone || 'N/A' }
      ];

      for (let i = 0; i < infoPairs.length; i += 2) {
        doc.setFont('helvetica', 'bold');
        doc.text(infoPairs[i].label, leftX, y);
        doc.setFont('helvetica', 'normal');
        doc.text(infoPairs[i].value, leftX + 40, y);

        if (i + 1 < infoPairs.length) {
          doc.setFont('helvetica', 'bold');
          doc.text(infoPairs[i + 1].label, rightX, y);
          doc.setFont('helvetica', 'normal');
          doc.text(infoPairs[i + 1].value, rightX + 40, y);
        }

        y += lineHeight;
      }

      y += 4;

      // Médecin
      doc.setFillColor(...primaryColor);
      doc.rect(10, y, pageWidth - 20, 8, 'F');
      doc.setTextColor(255);
      doc.setFontSize(11);
      const medecinText = 'DÉTAILS DU MÉDECIN';
      doc.text(medecinText, (pageWidth - doc.getTextWidth(medecinText)) / 2, y + 6);

      y += 12;
      doc.setTextColor(0);
      doc.setFontSize(10);

      doc.setFont('helvetica', 'bold');
      doc.text('AGENT CRÉATEUR:', 12, y);
      doc.setFont('helvetica', 'normal');
      doc.text(fiche.agentCreateur || 'N/A', 57, y);

      doc.setFont('helvetica', 'bold');
      doc.text('ADRESSE CRÉATEUR:', pageWidth / 2, y);
      doc.setFont('helvetica', 'normal');
      doc.text(fiche.adresseCreateur || 'N/A', pageWidth / 2 + 50, y);

      y += lineHeight;

      doc.setFont('helvetica', 'bold');
      doc.text('DATE DE CRÉATION:', 12, y);
      doc.setFont('helvetica', 'normal');
      doc.text(fiche.dateCreation || 'N/A', 57, y);

      y += lineHeight + 4;

      // Soins médicaux
      doc.setFillColor(...primaryColor);
      doc.rect(10, y, pageWidth - 20, 8, 'F');
      doc.setTextColor(255);
      doc.setFontSize(11);
      const soinsText = 'SOINS MÉDICAUX';
      doc.text(soinsText, (pageWidth - doc.getTextWidth(soinsText)) / 2, y + 6);

      y += 16;

      const body = soinsTrouves.map((soin: any) => [
        soin.dateAjout ? new Date(soin.dateAjout).toLocaleDateString() : 'N/A',
        soin.nom || 'N/A',
        soin.contenu || 'N/A'
      ]);
      

      autoTable(doc, {
        startY: y,
        head: [['DATE', 'TRAITEMENT', 'DESCRIPTION']],
        body: body,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: 0,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold',
        }
      });

      y = (doc as any).lastAutoTable.finalY + 8;

      const agent = fiche.agentCreateur?.toLowerCase() || '';
      let logoSrc = '';

      if (agent.includes('sfax medina')) logoSrc = '../../assets/images/clinic1.png';
      else if (agent.includes('ibn khaldoun')) logoSrc = '../../assets/images/clinic2.png';
      else if (agent.includes('errayhane')) logoSrc = '../../assets/images/clinic3.png';
      else if (agent.includes('syphax')) logoSrc = '../../assets/images/clinic4.png';
      else if (agent.includes('el bassatine')) logoSrc = '../../assets/images/clinic5.png';
      else if (agent.includes('arij')) logoSrc = '../../assets/images/clinic8.png';
      else if (agent.includes('ennasr')) logoSrc = '../../assets/images/clinic9.png';

      if (logoSrc) {
        const logoAgent = new Image();
        logoAgent.src = logoSrc;
        logoAgent.onload = () => {
          doc.addImage(logoAgent, 'PNG', pageWidth - 50, 5, 40, 30);
          doc.save(`Fiche-${nomPatient}.pdf`);
        };
      } else {
        doc.save(`Fiche-${nomPatient}.pdf`);
      }
    };
  }



  loadImages(): void {
    this.db.list('imagesMedicales', ref =>
      ref.orderByChild('dossierId').equalTo(this.patient.id)
    )
      .snapshotChanges()
      .subscribe(ficheChanges => {
        const fiches = ficheChanges.map(c => ({
          id: c.payload.key,
          ...(c.payload.val() as any),
        }));

        this.images = fiches;
      });
  }

  openAddImage(patientId: string): void {
    const dialogRef = this.dialog.open(AddImageComponent, {
      disableClose: true,
      data: { patientId } // 👈 on passe l'id ici
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadImages();
      }
    });
  }
  openEditImage(imageKey: string, imageData: any): void {
    const dialogRef = this.dialog.open(EditImageComponent, {
      disableClose: true,
      data: {
        imageKey: imageKey, // la clé Firebase de l'image
        image: imageData    // l'objet image (pour préremplir le formulaire)
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadImages();
      }
    });
  }
  deleteImage(imageKey: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Êtes-vous sûr de vouloir supprimer cette image ?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.db.object(`imagesMedicales/${imageKey}`).remove()
          .then(() => {
            console.log('Image supprimée de Firebase.');
          })
          .catch(err => {
            console.error('Erreur lors de la suppression :', err);
          });
      }
    });
  }
  openAddAnalyse(patientId: string): void {
    const dialogRef = this.dialog.open(AddAnalyseComponent, {
      disableClose: true,
      data: { patientId } // 👈 on passe l'id ici
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadImages();
      }
    });
  }
  telechargerPDF(pdfUrl: string): void {
    if (!pdfUrl) {
      console.error('URL du PDF est vide.');
      return;
    }

    const urlDownload = pdfUrl.includes('fl_attachment')
      ? pdfUrl
      : pdfUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');

    console.log('URL de téléchargement:', urlDownload); // Vérifier l'URL de téléchargement

    fetch(urlDownload)
      .then(response => {
        console.log('Réponse du serveur:', response); // Vérifier la réponse du serveur
        const contentType = response.headers.get("Content-Type") || "";
        console.log('Content-Type reçu :', contentType); // Afficher le Content-Type reçu

        // Vérification si la réponse est correcte et si le type de contenu est un PDF
        if (!response.ok) {
          throw new Error(`Erreur lors du téléchargement : ${response.statusText}`);
        }
        if (!contentType.includes("pdf")) {
          throw new Error(`Type de contenu invalide : ${contentType}`);
        }

        // Convertir la réponse en un Blob
        return response.blob();
      })
      .then(blob => {
        // Créer une URL pour le fichier téléchargé
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rapport.pdf'; // Nom du fichier à télécharger
        document.body.appendChild(a);
        a.click(); // Lancer le téléchargement
        a.remove(); // Retirer l'élément du DOM
        window.URL.revokeObjectURL(url); // Libérer l'URL de l'objet
      })
      .catch(error => {
        console.error('Erreur lors du téléchargement du PDF :', error);
        alert("Erreur : le fichier n'est pas un PDF valide.");
      });
  }
  deleteAnalyse(analyseKey: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Êtes-vous sûr de vouloir supprimer cette analyse ?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.db.object(`analysesMedicales/${analyseKey}`).remove()
          .then(() => {
            console.log('Analyse supprimée de Firebase.');
          })
          .catch(err => {
            console.error('Erreur lors de la suppression :', err);
          });
      }
    });
  }

  openEditAnalyse(analyseKey: string, analyseData: any): void {
    const dialogRef = this.dialog.open(EditAnalyseComponent, {
      disableClose: true,
      data: {
        imageKey: analyseKey, // la clé Firebase de l'image
        image: analyseData    // l'objet image (pour préremplir le formulaire)
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadImages();
      }
    });
  }

}