import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import {Profil} from '../modele/class';
import { isNull, isUndefined } from 'util';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ProfilService {
  public profil:Profil;

  constructor(private storage:StorageService,public alertController: AlertController) { 
    this.profil = new Profil;
  }

  public async setProfil(profil:Profil){
    this.profil = profil
    await this.storage.setStorage("profil",JSON.stringify(this.profil));
    // console.log("set",this.profil);
  }

  public async getProfil(){
    await this.storage.getStorage("profil").then(el=> {
      (JSON.parse(el.value)===null) || (JSON.parse(el.value) === undefined) ? this.showEmptyProfil() :  this.profil = JSON.parse(el.value);
      }).catch(()=>this.showEmptyProfil());
  }

  private async showEmptyProfil(){
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      header: 'Attention !',
      message: 'Veuillez remplir votre profil avant de procéder à l\'envoi.',
      buttons: ['Compris']
    });

    await alert.present();
  }
}



