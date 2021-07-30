'use strict';

const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user.controller');

router.post('/users/:collection', UserController.createUser);
router.get('/users/:uid', UserController.readUser);
router.put('/users/:uid', UserController.updateUser);
router.delete('/users/:uid', UserController.deleteUser);

module.exports = router;
