'use strict';

const express = require('express');
const router = express.Router();

const AutenticacionController = require('../controllers/autenticacion.controller');

router.post('/register/:collection', AutenticacionController.register);

module.exports = router;
