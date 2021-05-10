'use strict';

const express = require('express');
const router = express.Router();

const ExampleController = require('../controllers/example.controller');

router.get('/holaMundo', ExampleController.holaMundo);

module.exports = router;
