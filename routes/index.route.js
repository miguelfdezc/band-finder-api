'use strict';

const express = require('express');
const router = express.Router();

// cargar rutas
const authRouter = require('./auth.route');
const userRouter = require('./user.route');
const postRouter = require('./post.route');
const eventRouter = require('./event.route');
const bandRouter = require('./band.route');

// rutas
router.use(authRouter);
router.use(userRouter);
router.use(postRouter);
router.use(eventRouter);
router.use(bandRouter);

module.exports = router;
