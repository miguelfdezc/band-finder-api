'use strict';

const express = require('express');
const router = express.Router();

// cargar rutas
const exampleRouter = require('./example.route');
const autenticacionRouter = require('./autenticacion.route');
const usuarioRouter = require('./usuario.route');

// rutas
router.use(exampleRouter);
router.use(autenticacionRouter);
router.use(usuarioRouter);

module.exports = router;
