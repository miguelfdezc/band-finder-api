'use strict';

const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user.controller');

router.get('/users/:uid', UserController.readUser);
router.put('/users/:uid', UserController.updateUser);

module.exports = router;
