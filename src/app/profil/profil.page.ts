import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ProfilService } from '../services/profil/profil.service';
import { Profil } from '../services/modele/class'
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-profil',
  templateUrl: 'profil.page.html',
  styleUrls: ['profil.page.scss']
})
export class ProfilPage {
  constructor(public profilService: ProfilService, public alertController: AlertController) {
  }

  onSubmitForm(form: NgForm) {
    this.profilService.setProfil(new Profil(form.value["nom"], form.value["prenom"], form.value["societe"])).then(() => this.showAlertSuccess()).catch(() => this.showAlertError());
  }

  private async showAlertSuccess() {
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      header: 'Succés',
      message: 'Votre profil à bien été enregistré.',
      buttons: ['Compris']
    });

    await alert.present();
  }
  private async showAlertError() {
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      header: 'Erreur',
      message: 'Un problème est survenue lors de l\'enregistrement.',
      buttons: ['Compris']
    });

    await alert.present();
  }


}
