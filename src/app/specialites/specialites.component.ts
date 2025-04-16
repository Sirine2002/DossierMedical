import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-specialites',
  templateUrl: './specialites.component.html',
  styleUrls: ['./specialites.component.css']
})
export class specialitesComponent {
  breadcrumbSegments: { label: string, url: string }[] = [];

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const urlSegments = event.urlAfterRedirects.split('/').filter(p => p);
        this.breadcrumbSegments = urlSegments.map((segment, index) => {
          const label = segment.toLowerCase() === 'home' ? 'Home' : segment.charAt(0).toUpperCase() + segment.slice(1);
          const path = '/' + urlSegments.slice(0, index + 1).join('/');
          return { label, url: segment.toLowerCase() === 'home' ? '/home' : path };
        });
      }
    });
  }
  showBackToTop = false;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showBackToTop = scrollY > 300; // Affiche le bouton après 300px de scroll
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}