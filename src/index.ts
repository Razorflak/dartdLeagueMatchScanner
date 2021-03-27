import express from 'express';

const app = express();

require('./loaders/express').default({ app });

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App listening on PORT ${port}`));
