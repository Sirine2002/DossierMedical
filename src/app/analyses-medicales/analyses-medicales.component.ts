import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Location } from '@angular/common';

@Component({
  selector: 'app-analyses-medicales',
  templateUrl: './analyses-medicales.component.html',
  styleUrls: ['./analyses-medicales.component.css']
})
export class AnalysesMedicalesComponent implements OnInit, OnDestroy {
  analysesMedicales: any[] = [];
  pagedAnalyses: any[] = [];
  pageSize: number = 4; // Nombre d'analyses par page
  pageIndex: number = 0; // Page courante
  private subscription: Subscription = new Subscription();

  constructor(private db: AngularFireDatabase, private location: Location) { }

  ngOnInit(): void {
    this.loadAnalyses();
  }

  loadAnalyses(): void {
    const analysesSub = this.db.list('analysesMedicales').snapshotChanges()
      .subscribe(analyses => {
        this.analysesMedicales = analyses.map(a => {
          const data = a.payload.val() as any;
          const id = a.key;
          return { id, ...data };
        });
        this.updatePagedAnalyses();
      });

    this.subscription.add(analysesSub);
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
