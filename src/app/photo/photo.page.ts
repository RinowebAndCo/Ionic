import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { PhotoService } from '../services/photo/photo.service';
import { ProfilService } from '../services/profil/profil.service';

@Component({
  selector: 'app-photo',
  templateUrl: 'photo.page.html',
  styleUrls: ['photo.page.scss']
})
export class PhotoPage {

  constructor(public photoService: PhotoService, public actionSheetController: ActionSheetController,public profilService:ProfilService) {}

  ngOnInit() {
  }

  public async showActionSheet(photo, position) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [
        {
          text: 'Envoyer',
          icon: 'send',
          role: 'send',
          handler: () => {
            this.photoService.envoyerMail(photo, position);
           }
        },{
        text: 'Supprimer',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePicture(photo, position);
        }
      }, {
        text: 'Retour',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
         }
      }]
    });
    await actionSheet.present();
  }
}
