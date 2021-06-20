import { exec } from 'child_process';
import appPath from 'app-root-path';
import config from '../../config';
import utils from '../services/utils';

export default class TransformImage {
  static magickImgPathExe = config.pathImageMagick;
  static tempPath = `${appPath}/${config.pathTmpProcessPerspective}`;

  static toMonochrome(imgSrcName: string): Promise<string> {
    const imgDestName = utils.getRandomFileName('jpg');
    return new Promise((resolve, reject) => {
      exec(
        `"${this.magickImgPathExe}" "${this.tempPath}/${imgSrcName}" -monochrome "${this.tempPath}/${imgDestName}"`,
        {
          cwd: `${appPath}/src/`
        },
        (error, stdout, stderr) => {
          if (error) {
            console.log(error);
            reject(error);
          }
          console.log('Transform toMonochrome OK');
          resolve(imgDestName);
        }
      );
    });
  }

  static resize(imageName: string): Promise<string> {
    //TODO déterminer la bonne taille pour la feuille de match pour le  resize
    const imgDestName = utils.getRandomFileName('jpg');
    return new Promise((resolve, reject) => {
      exec(
        `"${this.magickImgPathExe}" convert "${this.tempPath}/${imageName}" -resize 1346x1952! ${this.tempPath}/${imgDestName}`,
        {
          cwd: `${appPath}/src/`
        },
        (error, stdout, stderr) => {
          if (error) {
            console.log(error);
            reject(error);
          }
          resolve(imgDestName);
        }
      );
    });
  }

  static perspective(imgName: string, stringCoordinates: string): Promise<string> {
    const imgDestName = utils.getRandomFileName('jpg');
    return new Promise((resolve, reject) => {
      exec(
        `"${this.magickImgPathExe}" convert "${this.tempPath}/${imgName}" -matte -virtual-pixel transparent -distort Perspective "${stringCoordinates}" "${this.tempPath}/${imgDestName}"`,
        {
          cwd: `${appPath}/src/`
        },
        (error, stdout, stderr) => {
          if (error) {
            console.log(error);
            reject(error);
          }
          console.log('Transform OK');
          resolve(imgDestName);
        }
      );
    });
  }

  static crop(imgName: string, offsetX: number, offsetY: number, width: number, height: number): Promise<string> {
    const imgDestName = utils.getRandomFileName('jpg');
    return new Promise((resolve, reject) => {
      exec(
        `"${this.magickImgPathExe}" convert "${this.tempPath}/${imgName}" -crop ${width}x${height}+${offsetX}+${offsetY} "${this.tempPath}/${imgDestName}"`,
        {
          cwd: `${appPath}/src/`
        },
        (error, stdout, stderr) => {
          if (error) {
            console.log(error);
            reject(error);
          }
          console.log('Transform OK');
          resolve(imgDestName);
        }
      );
    });
  }
}
