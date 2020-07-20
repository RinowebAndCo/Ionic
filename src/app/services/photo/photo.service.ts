import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource, CameraDirection } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../storage/storage.service';
import { Photo } from '../modele/class';
const { Camera, Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public load: LoadingController;
  public photos: Photo[] = [];
  private PHOTO_STORAGE: string = "photos";
  private platform: Platform;

  constructor(platform: Platform, public loadingController: LoadingController, public alertController: AlertController, private storage: StorageService) {
    this.platform = platform;
  }

  public async loadSaved() {
    await this.storage.getStorage(this.PHOTO_STORAGE).then(el => this.photos = JSON.parse(el.value) || []);
    // If running on the web...
    if (!this.platform.is('hybrid')) {
      for (let photo of this.photos) {
        await this.storage.getFilesystem(photo.filepath).then(el => photo.base64 = `data:image/jpeg;base64,${el.data}`)
      }
    }
  }

  public async addNewToGallery(fromGallery: boolean) {
    let sourceCamera = fromGallery ? CameraSource.Photos : CameraSource.Camera;
    // Take photo || Choose photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      source: sourceCamera, 
      quality: 100, 
      direction: CameraDirection.Rear
    });

    const savedImageFile = await this.savePicture(capturedPhoto);

    // Add new photo to Photos array
    this.photos.unshift(savedImageFile);
    console.log(this.photos);
    // Cache all photo data for future retrieval
    await this.storage.setStorage(this.PHOTO_STORAGE,
      this.platform.is('hybrid')
        ? JSON.stringify(this.photos)
        : JSON.stringify(this.photos.map(p => {
          // Don't save the base64 representation of the photo data, 
          // since it's already saved on the Filesystem
          const photoCopy = { ...p };
          delete photoCopy.base64;

          return photoCopy;
        }))
    );
  }

  private async savePicture(cameraPhoto: CameraPhoto) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);

    const fileName = new Date().getTime() + '.jpeg';
    let savedFile;
    await this.storage.setFilesystem(fileName, base64Data).then(el => savedFile = el);

    if (this.platform.is('hybrid')) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }
    else {
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
  }

  private async readAsBase64(cameraPhoto: CameraPhoto) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });
      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  public async deletePicture(photo: Photo, position: number) {
    this.photos.splice(position, 1);
    await this.storage.setStorage(this.PHOTO_STORAGE, JSON.stringify(this.photos));
    const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
    await this.storage.deletFilesystem(filename);
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
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


    // Retrieve the validated form fields
    const Host = 'mail.rinoweb.fr',
      Username = 'contact@rinoweb.fr',
      Password = 'Rinoweb&Co4!20',
      To = 'marino.theo@gmaiL.com',
      From = 'contact@rinoweb.fr',
      Subject = 'Test',
      Body = 'OK'



    // //SEND MAIL

    loading.dismiss();
    const alert = await this.alertController.create({
      cssClass: 'alert-class',
      header: 'Succés',
      message: 'Votre email à bien été envoyé.',
      buttons: ['Compris']
    });

    await alert.present();

    this.photos[position].send = true;
  }

}


