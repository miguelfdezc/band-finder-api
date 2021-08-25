'use strict';

const express = require('express');
const router = express.Router();

const EventController = require('../controllers/event.controller');

router.post('/events', EventController.createEvent);
router.put('/events/:id/subscription', EventController.updateSubscribed);
router.get('/events/:id', EventController.readEvent);
router.get('/events', EventController.readEvents);
router.get('/events/user/:uid', EventController.readEventsByUser);
router.get('/events/:uid/subscription', EventController.readEventsSubscribed);
router.put('/events/:id', EventController.updateEvent);
router.delete('/events/:id', EventController.deleteEvent);

module.exports = router;
