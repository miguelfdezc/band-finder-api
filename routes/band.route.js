'use strict';

const express = require('express');
const router = express.Router();

const BandController = require('../controllers/band.controller');

router.post('/bands', BandController.createBand);
router.get('/bands/:id', BandController.readBand);
router.get('/bands', BandController.readBands);
router.get('/bands/:uid/founder', BandController.readBandsByFounder);
router.get('/length/bands', BandController.getBandsLength);
router.post('/bands/:id/application', BandController.submitApplication);
router.put('/bands/:id/members', BandController.updateMembers);
router.put('/bands/:id', BandController.updateBand);
router.delete('/bands/:id', BandController.deleteBand);

module.exports = router;
