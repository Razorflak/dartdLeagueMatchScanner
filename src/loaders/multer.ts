import { Multer } from 'multer';
import * as appRoutePath from 'app-root-path';
import config from '../../config';

export const multer = require('multer');
var path = require('path');

var storageImgCommerce = multer.diskStorage({
  destination: function (req: Request, file: any, cb: any) {
    cb(null, `${appRoutePath}/${config.pathTmpImg}`);
  },
  filename: function (req: Request, file: any, cb: any) {
    cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
  }
});

const destImgCommerce = multer({
  storage: storageImgCommerce
});

export function fileUpload(req: Request, res: any, next: any) {
  destImgCommerce.single('file')(req, res, next);
}

console.info('####### MULTER Loaded #######');
