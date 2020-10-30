import { Injectable } from '@angular/core';
import { Camera as CameraWeb, CameraResultType, CameraPhoto, CameraSource, CameraDirection } from '@capacitor/core';
import { Camera as CameraAndroid, CameraOptions } from '@ionic-native/camera/ngx';

import { Platform } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../storage/storage.service';
import { Photo } from '../modele/class';
import { ProfilService } from '../profil/profil.service';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public load: LoadingController;
  public photos: Photo[] = [];
  private PHOTO_STORAGE: string = "photos";
  private platform: Platform;

  constructor(
    platform: Platform,
    public loadingController: LoadingController,
    public alertController: AlertController,
    private storage: StorageService,
    public profilService: ProfilService,
    public http: HttpClient,
    private camera: CameraAndroid

  ) {
    this.platform = platform;
  }


  public async loadSaved() {
    console.log("Current Platform : ", this.platform.platforms());
    await this.storage.getStorage(this.PHOTO_STORAGE).then(el => this.photos = JSON.parse(el.value) || []);
    // Si application web
    if (!this.platform.is('hybrid')) {
      for (let photo of this.photos) {
        // Récuperation base64
        await this.storage.getFilesystem(photo.filepath).then(el => photo.base64 = `data:image/jpeg;base64,${el.data}`)
      }
    }
  }

  public async addNewToGallery() {
    let capturedPhoto: CameraPhoto;
    // CAMERA WEB
    await CameraWeb.getPhoto(
      {
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 100,
        direction: CameraDirection.Rear
      }
    ).then(photo => capturedPhoto = photo)
      .catch(err => console.log("ERREUR CAMERA WEB", err)
      );

    await this.getBase64AndSavePicture(capturedPhoto);

  }

  public async openGallery() {
    if (this.platform.is('desktop') || this.platform.is('mobileweb')) {
      const alert = await this.alertController.create({
        cssClass: 'alert-class',
        header: 'Attention !',
        message: 'Aucune gallerie disponible.',
        buttons: ['Compris']
      });
      await alert.present();
    } else {

      let base64: string;
      // Image depuis la gallerie
      await this.camera.getPicture(
        {
          sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          correctOrientation: true
        }
      ).then(file_uri => base64 = "data:image/jpeg;base64," + file_uri)
        .catch(err => console.log("ERREUR GALLERY", err)
        );
      const fileName = new Date().getTime() + '.jpeg';
      // Save photo
      await this.storage.setFilesystem(fileName, base64);
      let webView: string;
      await fetch(base64)
        .then(res => {
          return res.blob();
        })
        .then(blob => webView = blob.text.toString()
        );

      let photo = {
        filepath: fileName,
        webviewPath: webView,
        base64: base64
      };
      this.savePicture(photo);
    }
  }

  private async getBase64AndSavePicture(cameraPhoto: CameraPhoto) {
    // Convert photo to base64 format
    const base64Data = await this.readAsBase64(cameraPhoto.webPath);
    const fileName = new Date().getTime() + '.jpeg';
    // Save photo
    await this.storage.setFilesystem(fileName, base64Data);
    let savedImageFile = {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath,
      base64: base64Data
    };
    this.savePicture(savedImageFile);
  }

  public async savePicture(savedImageFile) {
    // Ajouter la photo à ma liste
    this.photos.unshift(savedImageFile);
    // Enregistrer photo en local
    await this.storage.setStorage(this.PHOTO_STORAGE,
      this.platform.is('hybrid')
        ? JSON.stringify(this.photos)
        : JSON.stringify(this.photos.map(p => {
          const photoCopy = { ...p };
          delete photoCopy.base64;
          return photoCopy;
        }))
    );
  }

  public async deletePicture(photo: Photo, position: number) {
    this.photos.splice(position, 1);
    await this.storage.setStorage(this.PHOTO_STORAGE, JSON.stringify(this.photos));
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    await this.storage.deletFilesystem(filename);
  }

  private async readAsBase64(webPath: string) {
    const response = await fetch(webPath);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
  }

  public convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });


  public async envoyerMail(photo: Photo, position: number) {
    const loading = await this.loadingController.create({
      cssClass: 'loading-class',
      message: 'Veuillez patienter...',
      duration: 0
    });
    await loading.present();

    // //SEND MAIL
    this.convertToBlobAndSend(photo).then(() => {
      this.photos[position].send = true;
      this.alertEmailSent();
    }).catch(() => {
      this.alertEmailSentError();
    }).finally(() => {
      loading.dismiss();
    })

  }

  public async convertToBlobAndSend(photo: Photo) {
    var self = this;
    const formData = new FormData();
    formData.append('nom', this.profilService.profil.nom);
    formData.append('prenom', this.profilService.profil.prenom);
    formData.append('societe', this.profilService.profil.societe);
    console.log(photo);
    var base64Data = photo.base64;
    fetch(base64Data)
      .then(res => {
        return res.blob();
      })
      .then(blob => {
        console.log(blob);
        formData.append('file', blob, photo.filepath);
        self.uploadImageData(formData);
      });
  }

  public async uploadImageData(formData: FormData) {

    this.http.post("https://rinoweb.fr/fileUpload.php", formData)
      .subscribe(res => {
        if (res == 'success') {
          console.log('Email Envoyé');
        } else {
          console.log('Erreur Email');
        }
      });
  }

  public async alertEmailSent() {
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      header: 'Succés',
      message: 'Votre email à bien été envoyé.',
      buttons: ['Compris']
    });
    await alert.present();
  }

  public async alertEmailSentError() {
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      header: 'Erreur',
      message: 'Un problème est survenue.',
      buttons: ['Compris']
    });
    await alert.present();
  }


}


