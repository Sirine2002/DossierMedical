import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {


  images = [
    'assets/images/MEDICAL (4).png',
    'assets/images/MEDICAL (5).png',
    'assets/images/MEDICAL (6).png'
  ];
  currentImage = 0;

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
  blogNews = [
    { image: 'assets/images/news1.jpg' },
    { image: 'assets/images/news2.jpg' },
    { image: 'assets/images/news3.jpg' },
    { image: 'assets/images/news4.jpg' },
  ];




  constructor() {
    setInterval(() => {
      this.currentImage = (this.currentImage + 1) % this.images.length;
    }, 3000); // Change toutes les 3 secondes
  }
  showBackToTop = false;

  // Détection du scroll
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showBackToTop = scrollY > 300; // Affiche le bouton après 300px de scroll
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}


