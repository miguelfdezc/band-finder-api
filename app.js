'use strict';

const express = require('express');
const logger = require('morgan');
const fs = require('fs');
const cors = require('cors');
const moment = require('moment');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// cargar rutas
const router = require('./routes/index.route');

// middlewares
app.use(cors()); // Configurar cabeceras y cors
app.use(
  logger('combined', {
    stream: fs.createWriteStream(
      './logs/' + moment().format('YYYY-MM-DD') + '.log',
      {
        flags: 'a',
      }
    ),
  })
); // probar con: tiny, short, dev, common, combined
app.use(logger('dev'));

// rutas
app.use('/api', router);

app.get('/', function (req, res) {
  res.redirect('/api');
});

app.get('*', function (req, res) {
  res.status(404).send({ message: 'Page Not Found' });
});

module.exports = app;
