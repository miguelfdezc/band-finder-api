'use strict';

const express = require('express');
const router = express.Router();

// cargar rutas
const authRouter = require('./auth.route');
const userRouter = require('./user.route');

// rutas
router.use(authRouter);
router.use(userRouter);

module.exports = router;
