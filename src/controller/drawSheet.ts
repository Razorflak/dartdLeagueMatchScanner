import gm from 'gm';

export default class DrawSheet {
  static async drawSquareOnSheet(): Promise<void> {
    console.log('1BEF draw');
    gm('../temp/scanProcess/TestFinal.jpg')
      .drawRectangle(10, 100, 260, 210)
      .write('../temp/scanProcess/outDraw.jpg', (err) => {
        console.log('FINI', err);
      });
  }
}
