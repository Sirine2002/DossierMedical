import { User } from './Utilisateur';

export interface Medecin extends User {
  specialite: string;
}
