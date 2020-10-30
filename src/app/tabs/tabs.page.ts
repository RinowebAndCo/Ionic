import { Component } from '@angular/core';
import { ProfilService } from '../services/profil/profil.service';
import { PhotoService } from '../services/photo/photo.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  private platform: Platform;

  constructor(public photoService: PhotoService, public profilService: ProfilService, platform: Platform, private androidPermissions: AndroidPermissions) {
    this.platform = platform;
    this.init();
  }

  async init() {
    if (this.platform.is('hybrid')) {
      await this.checkPermission().then(() => {
        this.profilService.getProfil().then(() => {
          this.photoService.loadSaved();
        });
      });
    } else {
      await this.profilService.getProfil();
      await this.photoService.loadSaved();
    }
  }

  public async checkPermission() {

    // READ FILE
    await this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, this.androidPermissions.PERMISSION.GET_ACCOUNTS]);
    await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
      result => console.log('Has permission READ_EXTERNAL_STORAGE?', result.hasPermission),
    );

    //SAVE FILE
    await this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE, this.androidPermissions.PERMISSION.GET_ACCOUNTS]);
    await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
      result => console.log('Has permission WRITE_EXTERNAL_STORAGE?', result.hasPermission),
    );

    // CAMERA
    await this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, this.androidPermissions.PERMISSION.GET_ACCOUNTS]);
    await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
      result => console.log('Has permission CAMERA?', result.hasPermission),
    );

    // FLASHLIGHT
    await this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.FLASHLIGHT, this.androidPermissions.PERMISSION.GET_ACCOUNTS]);
    await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.FLASHLIGHT).then(
      result => console.log('Has permission FLASHLIGHT?', result.hasPermission),
    );
  }
}
