import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent {
  services = [
    {
      icon: 'assets/images/suivi.png',
      title: 'Consultations et Suivi',
      description: 'Suivi simple et rapide.'
    },
    {
      icon: 'assets/images/gestion.png',
      title: 'Partage Dossier Sécurisé',
      description: 'Partage sûr et contrôlé.'
    },
    {
      icon: 'assets/images/scan.png',
      title: 'Examens en Ligne',
      description: 'Résultats accessibles partout.'
    },
    {
      icon: 'assets/images/traitement.png',
      title: 'Suivi des Traitements',
      description: 'Rappels et prises suivies.'
    },
  ];
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