'use strict';

const app = require('./app');
const dotenv = require('dotenv').config();

const port = process.env.APP_PORT || 8000;

app.listen(port, () =>
  console.log(
    `Servidor ${process.env.APP_NAME} escuchando en http://${process.env.APP_HOST}:${port}...`
  )
);
