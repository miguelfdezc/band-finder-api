'use strict';

const express = require('express');
const router = express.Router();

const AutenticacionController = require('../controllers/autenticacion.controller');

router.post('/register/:collection', AutenticacionController.register);
router.post('/permisos/admin', AutenticacionController.checkAdmin);

module.exports = router;
