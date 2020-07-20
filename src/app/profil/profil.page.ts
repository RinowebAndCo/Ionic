import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ProfilService} from '../services/profil/profil.service';
import {Profil} from '../services/modele/class'
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-profil',
  templateUrl: 'profil.page.html',
  styleUrls: ['profil.page.scss']
})
export class ProfilPage {

  constructor(public profilService : ProfilService,public alertController: AlertController) {
    this.profilService.getProfil();
  }

  onSubmitForm(form: NgForm) {
    this.profilService.setProfil(new Profil(form.value["nom"],form.value["prenom"],form.value["societe"])).then(el=> this.showAlert());
  }

  private async showAlert(){
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      header: 'Succés',
      message: 'Votre profil à bien été enregistré.',
      buttons: ['Compris']
    });

    await alert.present();
  }

}
