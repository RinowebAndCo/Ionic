import { isNull, isUndefined } from 'util';
  
export class Profil{
    nom:string;
    societe:string;
    prenom:string;
    constructor(nom?,prenom?,societe?){
      this.nom = isUndefined(nom) || isNull(nom) ? "" : nom;
      this.prenom = isUndefined(prenom) || isNull(prenom)  ? "" : prenom;
      this.societe = isUndefined(societe) || isNull(societe)  ? "" : societe;
  
    }
}

export interface Photo {
  filepath: string;
  webviewPath: string;
  base64?: string;
  send?:boolean;
}