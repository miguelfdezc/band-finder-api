'use strict';

const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user.controller');

router.post('/users/:collection', UserController.createUser);
router.get('/users/:uid', UserController.readUser);
router.get('/users/collection/:type', UserController.readUsers);
router.get('/length/musicians', UserController.getMusiciansLength);
router.get('/length/businesses', UserController.getBusinessesLength);
router.put('/users/:uid', UserController.updateUser);
router.put('/users/:uid/fans', UserController.updateFans);
router.delete('/users/:uid', UserController.deleteUser);

module.exports = router;
