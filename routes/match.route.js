'use strict';

const express = require('express');
const router = express.Router();

const MatchController = require('../controllers/match.controller');

router.post('/matching', MatchController.matchBand);

module.exports = router;
