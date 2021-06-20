import express from 'express';
import cors from 'cors';
import scanSheet from '../controller/scanSheet';
import generateData from '../controller/generateDataSheet';
import appPath from 'app-root-path';
import { fileUpload } from '../loaders/multer';

export default ({ app }: { app: express.Application }) => {
  app.get('/status', (req, res) => {
    res.status(200).send({ appPath });
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });

  app.get('/scanSheet', fileUpload, async (req: any, res: any) => {
    try {
      const result = await scanSheet.scanSheet('Test.jpg');
      res.header('Content-Type', 'application/json');
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.get('/generateData', async (req: any, res: any) => {
    try {
      const test = require('../mock/jsonGoogleAfterTransform.json');
      const conf = require('../../config/coordinatesElementsMatchSheet.json');
      const result = await generateData.call(test, conf);
      res.header('Content-Type', 'application/json');
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.use(cors());
};
