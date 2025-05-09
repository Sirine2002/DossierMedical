import { LigneFicheSoin } from './LigneFicheSoin';

export interface FicheSoin {
  numero:string;
  dateCreation: string;
  agentCreateur: string;
  adresseCreateur: string;
  lignesFicheSoin?: LigneFicheSoin[];
}
