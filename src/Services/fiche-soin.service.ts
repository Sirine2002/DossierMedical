import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FicheSoinService {
  // Crée un comportement de sujet pour partager l'état entre les composants
  private ficheIdSource = new BehaviorSubject<string>(''); // Comportement initial (valeur vide)
  ficheId$ = this.ficheIdSource.asObservable(); // Observable qui émettra la valeur de ficheId

  // Méthode pour mettre à jour l'ID de la fiche
  setFicheId(ficheId: string): void {
    this.ficheIdSource.next(ficheId);
  }
  
  // Méthode pour récupérer l'ID de la fiche
  getFicheId(): string { // Ajout temporaire pour déboguer
    return this.ficheIdSource.getValue();
  }
}
