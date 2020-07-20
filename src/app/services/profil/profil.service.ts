import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import {Profil} from '../modele/class';
import { isNull, isUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {
  public profil:Profil;

  constructor(private storage:StorageService) { 
    this.profil = new Profil;
  }

  public async setProfil(profil:Profil){
    this.profil = profil
    await this.storage.setStorage("profil",JSON.stringify(this.profil));
    console.log("set",this.profil);
  }

  public async getProfil(){
    await this.storage.getStorage("profil").then(el=> {
      isNull(JSON.parse(el.value)) || isUndefined(JSON.parse(el.value)) ? null :  this.profil = JSON.parse(el.value);
      console.log("load",el.value)
      });
  }
}



