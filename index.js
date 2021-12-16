'use strict';

const app = require('./app');
const dotenv = require('dotenv').config();

const port = process.env.PORT || 8000;
const url =
  process.env.ENV === 'production'
    ? `https://band-finder-api.herokuapp.com:${port}`
    : `http://localhost:${port}`;

app.listen(port, () =>
  console.log(`Servidor ${process.env.APP_NAME} escuchando en ${url}`)
);
