'use strict';

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/auth.controller');

router.post('/auth/admin', AuthController.checkAdmin);

module.exports = router;
