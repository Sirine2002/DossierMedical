import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  filterDate: string = '';
  filterAgent: string = '';
  filtreForm: FormGroup;
  selectedFilter: 'date' | 'agent' = 'agent'; // Valeur par défaut
  private subscription: Subscription = new Subscription();

  constructor(private db: AngularFireDatabase, private location: Location, private fb: FormBuilder) {
    
    this.filtreForm = this.fb.group({
      filterType: ['date'], // par défaut
      date: [''],
      agent: ['']
    });
  }

  ngOnInit(): void {
    this.loadAnalyses();
  }

  loadAnalyses(): void {
    const analysesSub = this.db.list('analysesMedicales').snapshotChanges()
      .subscribe(analyses => {
        this.allAnalysesMedicales = analyses.map(a => {
          const data = a.payload.val() as any;
          const id = a.key;
          return { id, ...data };
        });
        this.applyFilters();
      });

    this.subscription.add(analysesSub);
  }

  applyFilters(): void {
    const { filterType, date, agent } = this.filtreForm.value;
    if (filterType === 'date') {
      console.log('Filtrage par date :', date);
    } else {
      console.log('Filtrage par agent :', agent);
    }
  
  
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

  retour(): void {
    this.location.back();
  }
}
