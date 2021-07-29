'use strict';

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');

router.post('/register/:collection', AuthController.register);

module.exports = router;
