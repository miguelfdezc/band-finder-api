'use strict';

const { admin, db } = require('./firebase.service');

const service = {
  readUser: async function (uid) {
    let userDB = null;
    try {
      const userWithClaims = await admin.auth().getUser(uid);

      const userRef = db.collection(userWithClaims.customClaims.type).doc(uid);

      userDB = await userRef.get();

      return { ...userWithClaims, ...userDB.data() };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
};

module.exports = service;
