import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { Location } from '@angular/common';

@Component({
  selector: 'app-images-medicales',
  templateUrl: './images-medicales.component.html',
  styleUrls: ['./images-medicales.component.css']
})
export class ImagesMedicalesComponent implements OnInit, OnDestroy {
  imagesMedicales: any[] = [];
  pagedImages: any[] = [];
  pageSize: number = 4; // Nombre d'images par page
  pageIndex: number = 0; // Page courante
  private subscription: Subscription = new Subscription();

  constructor(private db: AngularFireDatabase,private location: Location) {
    
  }

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    const imagesSub = this.db.list('imagesMedicales').snapshotChanges()
      .subscribe(images => {
        this.imagesMedicales = images.map(i => {
          const data = i.payload.val() as any;
          const id = i.key;
          return { id, ...data };
        });
        this.updatePagedImages();
      });

    this.subscription.add(imagesSub);
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
