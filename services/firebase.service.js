const dotenv = require('dotenv').config();

var admin = require('firebase-admin');

var serviceAccount = require('../credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.PROJECT_ID,
});

const db = admin.firestore();

module.exports = { admin, db };
