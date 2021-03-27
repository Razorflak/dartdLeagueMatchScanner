import googleVision from '@google-cloud/vision';
import { IGoogeVisonElement } from '../interfaces/IGoogleVisonsElement';
import { IPoint } from '../interfaces/IPoint';
import appPath from 'app-root-path';
import { exec } from 'child_process';
import imgSize from 'image-size';
import DrawSheet from './drawSheet';

export default class ScanSheet {
  //TODO à déplacer dans .env
  static magickImgPathExe = 'C:/Program Files/ImageMagick-7.0.11-Q16-HDRI/magick.exe';
  static tempPath = `${appPath}/src/temp/scanProcess`;

  static async scanSheet(imgSourceName: string): Promise<any> {
    console.log('START');
    try {
      // TODO Appel de l'API Google pour obtenir les infos de l'image

      const dataExample: any = require('../mock/jsonGoogle.json');
      /*const elementsExemple: Array<IGoogeVisonElement> = dataExample.responses[0].textAnnotations;
      const tempNameFile = await this.transformPerspectivImg(imgSourceName, elementsExemple);
      const finaleNameFile = await this.resizeAndColorTransform(tempNameFile);*/
      DrawSheet.drawSquareOnSheet();
    } catch (error) {
      console.debug('Error:' + JSON.stringify(error));
      throw error;
    }
  }

  private static generateArrayCalibragePoints(arrayElements: Array<IGoogeVisonElement>): Array<IPoint> {
    // Récupération des champs de calibrage
    const arrayCalibrage: Array<IGoogeVisonElement> = arrayElements.filter((x) => x.description === 'DARTS44');

    if (arrayCalibrage.length !== 4) throw new Error("Erreur de calabrage. Les 4 points n'ont pas été trouvé");
    let result = new Array<IPoint>();
    for (const element of arrayCalibrage) {
      element.boundingPoly.vertices.forEach((element) => {
        result.push(element);
      });
    }
    return result;
  }

  private static getEndCoordinates(top: boolean, left: boolean, arrayPoints: Array<IPoint>): IPoint | null {
    //Calcule de la moyenne des coordoné x et y
    let moyenneX = 0,
      moyenneY = 0,
      nbrValeur = 0;
    for (const point of arrayPoints) {
      moyenneY += point.y;
      moyenneX += point.x;
      nbrValeur++;
    }
    moyenneX = moyenneX / nbrValeur;
    moyenneY = moyenneY / nbrValeur;

    const pointsMatches = arrayPoints.filter((point) => point.x < moyenneX === left && point.y < moyenneY === top);
    if (pointsMatches.length === 0) {
      console.debug('Error during getEndCoordinates, no match points found');
      return null;
    } else if (pointsMatches.length === 1) {
      return pointsMatches[0];
    }
    return this.getEndCoordinates(top, left, pointsMatches);
  }

  private static async transformPerspectivImg(
    imgName: string,
    sheetElements: Array<IGoogeVisonElement>
  ): Promise<string> {
    console.log('BEF exec');
    const pointsCalibrage: Array<IPoint> = this.generateArrayCalibragePoints(sheetElements);
    const topLeftPoint: IPoint | null = this.getEndCoordinates(true, true, pointsCalibrage);
    const topRightPoint: IPoint | null = this.getEndCoordinates(true, false, pointsCalibrage);
    const bottomLeftPoint: IPoint | null = this.getEndCoordinates(false, true, pointsCalibrage);
    const bottomRightPoint: IPoint | null = this.getEndCoordinates(false, false, pointsCalibrage);

    //Getting image dimensions
    const imgData = imgSize(`${this.tempPath}/${imgName}`);

    //Generating coordinates tranform
    const stringCoordinates = `${topLeftPoint!.x},${topLeftPoint!.y} 0,0   ${topRightPoint!.x},${topRightPoint!.y} ${
      imgData.width
    },0   ${bottomRightPoint!.x},${bottomRightPoint!.y} ${imgData.width},${imgData.height}   ${bottomLeftPoint!.x},${
      bottomLeftPoint!.y
    } 0,${imgData.height}`;

    const imgDestName = `toCrop_${imgName}`;
    //Execute perspectiv transform
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

  private static async resizeAndColorTransform(imageName: string): Promise<string> {
    //TODO déterminer la bonne taille pour la feuille de match pour le  resize
    const imgNameDest = 'TestFinal.jpg';
    return new Promise((resolve, reject) => {
      exec(
        `"${this.magickImgPathExe}" convert "${this.tempPath}/${imageName}" -resize 1346x1952! ${this.tempPath}/${imgNameDest}`,
        {
          cwd: `${appPath}/src/`
        },
        (error, stdout, stderr) => {
          resolve(imgNameDest);
        }
      );
    });
  }
}
