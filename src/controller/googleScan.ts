import gv from '@google-cloud/vision';
import appPath from 'app-root-path';
import fs from 'fs';

export default class GoogleVision {
  static async scanImg(imgPath: string): Promise<any> {
    try {
      console.info(`Scan by googleApi of file ${imgPath}`);
      const client = new gv.ImageAnnotatorClient();

      // Performs label detection on the image file
      const result = await client.documentTextDetection(imgPath);
      return result;
    } catch (error) {
      throw `Error during scan by Google API: ${error}`;
    }
  }

  /*******************************
   *  		Google Auth
   *******************************/

  private static async getJsonCredential(): Promise<any> {
    try {
      const content: string = await new Promise((resolve, reject) => {
        fs.readFile(`${appPath}/config/googleCrendential.json`, (err, data) => {
          if (err) {
            reject('Error loading client secret file');
          }
          resolve(data.toString());
        });
      });
      return JSON.parse(content);
    } catch (error) {
      throw error;
    }
  }
}
