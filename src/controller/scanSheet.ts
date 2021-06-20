import { IGoogeVisonElement } from '../interfaces/IGoogleVisonsElement';
import { IPoint } from '../interfaces/IPoint';
import appPath from 'app-root-path';
import imgSize from 'image-size';
import config from '../../config';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import googleScan from './googleScan';
import TransformImage from './transformImage';

export default class ScanSheet {
  //TODO à déplacer dans .env
  static magickImgPathExe = config.pathImageMagick;
  static tempPath = `${appPath}/${config.pathTmpProcessPerspective}`;

  static async scanSheet(imgSourceName: string): Promise<any> {
    console.log('START');
    try {
      const initialGoogleScan = await googleScan.scanImg(`${this.tempPath}/${imgSourceName}`);
      const elementsExemple: Array<IGoogeVisonElement> = initialGoogleScan[0].textAnnotations;
      const tempNameFile = await this.transformPerspectivImg(imgSourceName, elementsExemple);
      const finaleNameFile = await TransformImage.resize(tempNameFile);
      const formatGoogleScan = await googleScan.scanImg(`${this.tempPath}/${finaleNameFile}`);
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
    //Calcul de la moyenne des coordoné x et y
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

  private static transformPerspectivImg(imgName: string, sheetElements: Array<IGoogeVisonElement>): Promise<string> {
    const pointsCalibrage: Array<IPoint> = this.generateArrayCalibragePoints(sheetElements);
    const topLeftPoint: IPoint | null = this.getEndCoordinates(true, true, pointsCalibrage);
    const topRightPoint: IPoint | null = this.getEndCoordinates(true, false, pointsCalibrage);
    const bottomLeftPoint: IPoint | null = this.getEndCoordinates(false, true, pointsCalibrage);
    const bottomRightPoint: IPoint | null = this.getEndCoordinates(false, false, pointsCalibrage);

    //Getting image dimensions
    let imgData: ISizeCalculationResult;
    try {
      imgData = imgSize(`${this.tempPath}/${imgName}`);
    } catch (error) {
      throw new Error(`Error during getting size of: ${imgName}`);
    }
    //Generating coordinates tranform
    const stringCoordinates = `${topLeftPoint!.x},${topLeftPoint!.y} 0,0   ${topRightPoint!.x},${topRightPoint!.y} ${
      imgData.width
    },0   ${bottomRightPoint!.x},${bottomRightPoint!.y} ${imgData.width},${imgData.height}   ${bottomLeftPoint!.x},${
      bottomLeftPoint!.y
    } 0,${imgData.height}`;
    //Execute perspectiv transform
    return TransformImage.perspective(imgName, stringCoordinates);
  }
}
