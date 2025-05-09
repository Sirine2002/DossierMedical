import { FicheSoin } from './FicheSoin';
import { ImageMedicale } from './ImageMedicale';
import { AnalyseMedicale } from './AnalyseMedicale';

export interface Dossier {
  numero: string;
  dateCreation: string;
  codeAcces: string;
  etat: string;
  fichesSoin?: FicheSoin[];
  imagesMedicales?: ImageMedicale[];
  analysesMedicales?: AnalyseMedicale[];
}
