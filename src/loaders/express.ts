import express from 'express';
import cors from 'cors';
import scanSheet from '../controller/scanSheet';
import appPath from 'app-root-path';

export default ({ app }: { app: express.Application }) => {
  app.get('/status', (req, res) => {
    res.status(200).send({ appPath });
  });
  app.head('/status', (req, res) => {
    res.status(200).end();
  });

  app.get('/scanSheet', async (req, res) => {
    try {
      const result = await scanSheet.scanSheet('Test.jpg');
      res.header('Content-Type', 'application/json');
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  app.use(cors());
};
