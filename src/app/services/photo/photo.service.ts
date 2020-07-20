import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource,CameraDirection } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../storage/storage.service';
import { Photo} from '../modele/class';
const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public load:LoadingController;
  public photos: Photo[] = [];
  private PHOTO_STORAGE: string = "photos";
  private platform: Platform;

  constructor(platform: Platform,public loadingController: LoadingController,public alertController: AlertController,private storage:StorageService) {
    this.platform = platform;
   }

  public async loadSaved() {
    await this.storage.getStorage(this.PHOTO_STORAGE).then(el=>this.photos = JSON.parse(el.value) || []);
    // If running on the web...
    if (!this.platform.is('hybrid')) {
      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem Web platform only: Save the photo into the base64 field
         await this.storage.getFilesystem(photo.filepath).then(el=>{photo.base64 = `data:image/jpeg;base64,${el.data}`; console.log(el)});
      }
    }
  }

  public async addNewToGallery(fromGallery:boolean) {
    let sourceCamera = fromGallery ? CameraSource.Photos : CameraSource.Camera;
    // Take photo || Choose photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      source: sourceCamera, // automatically take a new photo with the camera
      quality: 100, // highest quality (0 to 100)
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

  // Save picture to file on device
  private async savePicture(cameraPhoto: CameraPhoto) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);

    // Write the file to the data directory
    const fileName = new Date().getTime() + '.jpeg';
    let savedFile;
    await this.storage.setFilesystem(fileName,base64Data).then(el=>savedFile = el);

    if (this.platform.is('hybrid')) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }
    else {
      // Use webPath to display the new image instead of base64 since it's 
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
  }

  // Read camera photo into base64 format based on the platform the app is running on
  private async readAsBase64(cameraPhoto: CameraPhoto) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
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

  // Delete picture by removing it from reference data and the filesystem
  public async deletePicture(photo: Photo, position: number) {
    // Remove this photo from the Photos reference data array
    this.photos.splice(position, 1);

    // Update photos array cache by overwriting the existing photo array
    await this.storage.setStorage(this.PHOTO_STORAGE,JSON.stringify(this.photos));

    // delete photo file from filesystem
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

  public async envoyerMail(photo: Photo, position: number){
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


