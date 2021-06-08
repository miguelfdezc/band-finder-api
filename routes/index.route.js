'use strict';

const express = require('express');
const router = express.Router();

// cargar rutas
const exampleRouter = require('./example.route');
const autenticacionRouter = require('./autenticacion.route');

// rutas
router.use(exampleRouter);
router.use(autenticacionRouter);

module.exports = router;
