import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-images-medicales',
  templateUrl: './images-medicales.component.html',
  styleUrls: ['./images-medicales.component.css']
})
export class ImagesMedicalesComponent implements OnInit, OnDestroy {
  imagesMedicales: any[] = []; // Images après filtrage
  allImagesMedicales: any[] = [];  
  pagedImages: any[] = [];
  pageSize: number = 4; // Nombre d'images par page
  pageIndex: number = 0; 
   filterDate: string = '';
  filterAgent: string = '';
  filtreForm: FormGroup;
  private subscription: Subscription = new Subscription();

  constructor(private db: AngularFireDatabase,private location: Location,private fb: FormBuilder) {
    this.filtreForm = this.fb.group({
      date: [''],
      agent: ['']
    });
  }

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    const imagesSub = this.db.list('imagesMedicales').snapshotChanges()
      .subscribe(images => {
        this.allImagesMedicales = images.map(i => {
          const data = i.payload.val() as any;
          const id = i.key;
          return { id, ...data };
        });
        this.applyFilters();
      });

    this.subscription.add(imagesSub);
  }

  applyFilters(): void {
    const { date, agent } = this.filtreForm.value;
  
    this.imagesMedicales = this.allImagesMedicales.filter(image => {
      let match = true;
  
      // Comparaison par date (en normalisant à minuit)
      if (date) {
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const imageDate = new Date(image.dateCreation);
        imageDate.setHours(0, 0, 0, 0);
        match = match && imageDate.getTime() === selectedDate.getTime();
      }
  
      // Comparaison par nom d'agent
      if (agent) {
        match = match && image.agentCreateur?.toString().toLowerCase().includes(agent.toLowerCase());
      }
  
      return match;
    });
  
    this.pageIndex = 0;
    this.updatePagedImages();
  }
  
  
  updatePagedImages() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedImages = this.imagesMedicales.slice(startIndex, endIndex);
  }

  onPageChanged(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedImages();
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
