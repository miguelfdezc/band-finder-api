'use strict';

const { admin, db } = require('./firebase.service');

const service = {
  checkAdmin: async function (uid) {
    try {
      const user = await admin.auth().getUser(uid);
      return user.customClaims.admin;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  checkAdminByEmail: async function (email) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      return user.customClaims.admin;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  getUserFromDB: async function (collection, uid) {
    try {
      const userRef = db.collection(collection).doc(uid);
      const userDB = await userRef.get();

      return userDB.data();
    } catch (err) {
      console.error(err);
      throw new Error(`Error al obtener el usuario de base de datos: ${err}`);
    }
  },
  getUserById: async function (uid) {
    try {
      const user = await admin.auth().getUser(uid);
      return user;
    } catch (err) {
      console.error(err);
      throw new Error(`Error al obtener el usuario a partir del UID: ${err}`);
    }
  },
  getUserByEmail: async function (email) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      return user;
    } catch (err) {
      console.error(err);
      throw new Error(`Error al obtener el usuario a partir del email: ${err}`);
    }
  },
};

module.exports = service;
