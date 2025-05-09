import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AnalyseService } from 'src/Services/analyse.service';

@Component({
  selector: 'app-analyses-medicales',
  templateUrl: './analyses-medicales.component.html',
  styleUrls: ['./analyses-medicales.component.css']
})
export class AnalysesMedicalesComponent implements OnInit, OnDestroy {
  analysesMedicales: any[] = [];         // Analyses après filtrage
  allAnalysesMedicales: any[] = [];  
  pagedAnalyses: any[] = [];
  pageSize: number = 4; // Nombre d'analyses par page
  pageIndex: number = 0; // Page courante
  filtreForm: FormGroup;
  selectedFilter: 'date' | 'agent' = 'agent'; // Valeur par défaut
  private subscription: Subscription = new Subscription();

  constructor(private db: AngularFireDatabase, private location: Location, private fb: FormBuilder,private analyseService: AnalyseService) {
    
    this.filtreForm = this.fb.group({
      date: [''],
      agent: ['']
    });
  }
  nomPatient: string = '';

  ngOnInit(): void {
    this.loadAnalyses();
    const storedName = localStorage.getItem('username');
    this.nomPatient = storedName ? storedName : 'Inconnu';
  }

  loadAnalyses(): void {
    const analysesSub = this.analyseService.getAnalyses().subscribe(analyses => {
      this.allAnalysesMedicales = analyses;
      this.applyFilters();
    });
  
    this.subscription.add(analysesSub);
  }

  applyFilters(): void {
    const { date, agent } = this.filtreForm.value;
  
  
  
    this.analysesMedicales = this.allAnalysesMedicales.filter(analyse => {
      let match = true;
  
      // Comparaison par date (en normalisant à minuit)
      if (date) {
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const analyseDate = new Date(analyse.dateCreation);
        analyseDate.setHours(0, 0, 0, 0);
        match = match && analyseDate.getTime() === selectedDate.getTime();
      }
  
      // Comparaison par nom d'agent
      if (agent) {
        match = match && analyse.agentCreateur?.toString().toLowerCase().includes(agent.toLowerCase());
      }
  
      return match;
    });
  
    this.pageIndex = 0;
    this.updatePagedAnalyses();
  }

  updatePagedAnalyses() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedAnalyses = this.analysesMedicales.slice(startIndex, endIndex);
  }

  onPageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedAnalyses();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  voirImage(imageUrl: string) {
    window.open(imageUrl, '_blank');
  }

  downloadAnalyse(imageUrl: string, nomPatient: string, fichierId: number) {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Simule un dossier en préfixant le nom du fichier (navigateur ne crée pas de dossier, mais ça aide à organiser)
        a.download = `${nomPatient}_analyse_${fichierId}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Erreur lors du téléchargement de l’image :', error);
      });
  }
  

  retour(): void {
    this.location.back();
  }
}
