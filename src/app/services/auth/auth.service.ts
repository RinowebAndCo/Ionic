import { Injectable } from "@angular/core";
import { Plugins,FilesystemDirectory } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { StorageService } from '../storage/storage.service';
import { isNull, isUndefined } from 'util';
const { Storage ,Filesystem} = Plugins;

@Injectable({
  providedIn: "root"
})
export class AuthService {
  isLoggedIn = false;
  private platform: Platform;

  constructor(platform: Platform, public storage:StorageService) {
    this.platform=platform;
  }

  setLoggedIn(_value) {
    this.saveAuth(_value);
  }

  async isAuthenticated() {
    this.isLoggedIn = await this.getAuth();
    return this.isLoggedIn
  }

  private async saveAuth(_value){


    await this.storage.setStorage("auth",JSON.stringify(_value));
    await this.storage.setFilesystem('auth.txt',JSON.stringify(_value))

    this.isLoggedIn = _value;

    // console.log("saveAuth Done",_value);
  }

  public async getAuth(){
      let storeValue:boolean=false,systemValue:boolean=false;

     await this.storage.getStorage("auth").then(el=> storeValue =  JSON.parse(el.value) || false);

      // console.log("STORAGE authValue",storeValue);

      if (!this.platform.is('hybrid')) {

          await this.storage.getFilesystem('auth.txt').then(el=>  systemValue = JSON.parse(el.data) || false);

          // console.log("FILESYSTEM fileValue",systemValue);

      } 
      return storeValue || systemValue;
  }
}