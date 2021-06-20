'use strict';

const express = require('express');
const router = express.Router();

const UsuarioController = require('../controllers/usuario.controller');

router.get('/usuarios/:uid', UsuarioController.readUsuario);

module.exports = router;
