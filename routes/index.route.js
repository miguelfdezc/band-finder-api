'use strict';

const express = require('express');
const router = express.Router();

// cargar rutas
const exampleRouter = require('./example.route');

// rutas
router.use(exampleRouter);

module.exports = router;
