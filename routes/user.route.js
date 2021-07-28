'use strict';

const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user.controller');

router.get('/users/:uid', UserController.readUser);

module.exports = router;
