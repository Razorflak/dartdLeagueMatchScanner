import { IGoogeVisonElement } from '../interfaces/IGoogleVisonsElement';
import { IPoint } from '../interfaces/IPoint';
import { protos } from '@google-cloud/vision';

export default class GenerateDataSheet {
  static call(dataSheet: protos.google.cloud.vision.v1.IAnnotateImageResponse, modelSheet: any): any {
    console.log('GenerateDataSheet starting process');
    const googleHeight = dataSheet.fullTextAnnotation!.pages![0].height!;
    const googleWidth = dataSheet.fullTextAnnotation!.pages![0].width!;
    const ratioX = googleWidth / modelSheet.referenceSize.x;
    const ratioY = googleHeight / modelSheet.referenceSize.y;
    dataSheet.textAnnotations;
    dataSheet.fullTextAnnotation?.pages;
    try {
      for (const [key, value] of Object.entries(modelSheet.data)) {
        // non-validated configuration object, go next
        try {
          if (!this.isCouplePoint(value)) throw `Invalid conf point: ${key}`;
          const result = this.getContentWord(value as Array<IPoint>, dataSheet.textAnnotations!, ratioX, ratioY, 0.02);
          console.log(`pour: ${key} trouvé pour : ${result}`);
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param confCoordinates Couple of IPoint that defined a data placement in model
   * @param dataCoordinates All text block find from Google API
   * @param xRatio Horizontal ratio to transform model to image processed
   * @param yRatio Horizontal ratio to transform model to image processed
   * @param marginError Margin of error allow to find a correspondance
   * @returns
   */
  private static getContentWord(
    confCoordinates: Array<IPoint>,
    dataCoordinates: Array<protos.google.cloud.vision.v1.IEntityAnnotation>,
    xRatio: number,
    yRatio: number,
    marginError: number
  ): string {
    try {
      if (marginError > 1 || marginError < 0) throw 'Invalid margin error value';
      const allMatchinWords = dataCoordinates.filter((elem) => {
        const topLeftCoordinatesSheet = elem!.boundingPoly!.vertices![0];
        const bottomRightCoordinatesSheet = elem!.boundingPoly!.vertices![2];
        //Conf data calcul
        const topLeftX = confCoordinates[0].x * xRatio * (1 - marginError);
        const topLeftY = confCoordinates[0].y * yRatio * (1 - marginError);
        const bottomRightX = confCoordinates[1].x * xRatio * (1 + marginError);
        const bottomRightY = confCoordinates[1].y * yRatio * (1 + marginError);

        return (
          topLeftCoordinatesSheet!.x! >= topLeftX &&
          bottomRightCoordinatesSheet!.x! >= topLeftX &&
          topLeftCoordinatesSheet!.y! >= topLeftY &&
          bottomRightCoordinatesSheet!.y! >= topLeftY &&
          topLeftCoordinatesSheet!.x! <= bottomRightX &&
          bottomRightCoordinatesSheet!.x! <= bottomRightX &&
          bottomRightCoordinatesSheet!.y! <= bottomRightY &&
          topLeftCoordinatesSheet!.y! <= bottomRightY
        );
      });
      let result = '';
      for (const elem of allMatchinWords) {
        result += (elem as protos.google.cloud.vision.v1.IEntityAnnotation).description;
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  private static isCouplePoint(data: any): boolean {
    if (!Array.isArray(data)) return false;
    if (data.length !== 2) return false;
    data.forEach((element: IPoint) => {
      if (!element.x || !element.y) return false;
    });
    return true;
  }

  // In vision result
  // fullTextAnnotation => pages[] => blocks[] => paragraphs[] => words[] => symbols[] => text
  // ordre des points HG - HD - BD - BG
}
