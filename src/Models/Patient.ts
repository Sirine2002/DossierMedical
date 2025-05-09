import { User } from './Utilisateur';

export interface Patient extends User {
  dateNaissance: string;
  sexe: string;
  adresse: string;
}
