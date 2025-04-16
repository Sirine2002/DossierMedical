import { AfterViewInit, Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
declare const google: any;

@Component({
  selector: 'app-partenaires',
  templateUrl: './partenaires.component.html',
  styleUrls: ['./partenaires.component.css']
})
export class PartenairesComponent implements AfterViewInit {
  breadcrumbSegments: { label: string, url: string }[] = [];
  showBackToTop = false;

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

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showBackToTop = scrollY > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngAfterViewInit(): void {
    if (typeof google !== 'undefined' && google.maps) {
      this.initMap();
    } else {
      console.error('Google Maps API non chargée correctement.');
      alert('Erreur : Google Maps API n’a pas pu être chargée.');
    }
  }

  initMap(): void {
    const centerCoords = new google.maps.LatLng(36.8065, 10.1815); // Tunis
    const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
      center: centerCoords,
      zoom: 12,
    });

    const cliniques = [
      { name: 'Clinique El Amen', position: { lat: 36.815, lng: 10.181 } },
      { name: 'Clinique Ennasr', position: { lat: 36.861, lng: 10.206 } },
      { name: 'Polyclinique Sypahx', position: { lat: 36.805, lng: 10.135 } },
      { name: 'Clinique La Rose', position: { lat: 36.860, lng: 10.211 } },
      { name: 'Clinique El Yosr Sfax', position: { lat: 34.739, lng: 10.760 } },
      { name: 'Clinique Les Oliviers Sfax', position: { lat: 34.739, lng: 10.755 } },
      { name: 'Clinique Hannibal Sfax', position: { lat: 34.736, lng: 10.765 } },
      { name: 'Clinique Essalem Sousse', position: { lat: 35.827, lng: 10.636 } },
      { name: 'Clinique La Corniche Sousse', position: { lat: 35.825, lng: 10.632 } },
      { name: 'Clinique El Amen Gabès', position: { lat: 33.881, lng: 10.102 } },
      { name: 'Clinique Ibn Rochd Bizerte', position: { lat: 37.274, lng: 9.865 } },
      { name: 'Clinique Med Bizerte', position: { lat: 37.272, lng: 9.864 } },
    ];

    cliniques.forEach(clinique => {
      new google.maps.Marker({
        map,
        position: clinique.position,
        title: clinique.name
      });
    });
  }
}
