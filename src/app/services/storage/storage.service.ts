import { Injectable } from '@angular/core';
import { Plugins, Filesystem, FilesystemDirectory} from '@capacitor/core';
const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  public async setStorage(settingName,value){
    try{
      return await Storage.set({
      key: `setting:${ settingName }`,
      value : value
      });
    }catch (e){
      console.log("Error setStorage",e);
    } 
  }
  public async getStorage(settingName){
    try{
      return await Storage.get({
      key: `setting:${ settingName }`
      });
    }catch (e){
      console.log("Error getStorage",e);
    } 
  }

  public async setFilesystem(path,_value){
    try{
      await Filesystem.writeFile({
        path: path,
        data: _value,
        directory: FilesystemDirectory.Data
      });
    }catch (e){
      console.log("Error setFilesystem",e);
    } 
  }

  public async getFilesystem(path){
    try{
      return await Filesystem.readFile({
        path: path,
        directory: FilesystemDirectory.Data
      });
    }catch (e){
      console.log("Error getFilesystem",e);
    } 
  }

  public async deletFilesystem(filename){
    try{
      await Filesystem.deleteFile({
        path: filename,
        directory: FilesystemDirectory.Data
      });
    }catch (e){
      console.log("Error deletFilesystem",e);
    } 
  }
}
