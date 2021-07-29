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
  createUser: async function ({ usuario, email, password }, collection) {
    let user = null,
      userDB = null;
    try {
      user = await admin.auth().createUser({
        email,
        password,
        photoURL: 'https://image.flaticon.com/icons/png/512/848/848043.png',
      });
      await admin.auth().setCustomUserClaims(user.uid, {
        admin: collection === 'administradores',
        type: collection,
      });
      const userWithClaims = await admin.auth().getUser(user.uid);

      const userRef = db.collection(collection).doc(user.uid);
      if (collection === 'administradores') {
        userDB = { usuario };
      } else if (collection === 'musicos') {
        userDB = {
          usuario,
          descripcion: '',
          ubicacion: '',
          imagenFondo: '',
          actuaciones: 0,
          valoracion: 0.0,
          fans: 0,
        };
      } else if (collection === 'negocios') {
        userDB = {
          usuario,
          descripcion: '',
          ubicacion: '',
          imagenFondo: '',
        };
      }
      await userRef.set(userDB);
      userDB = await userRef.get();

      return { ...userWithClaims, ...userDB.data() };
    } catch (err) {
      if (user && user.uid) await admin.auth().deleteUser(user.uid);

      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
};

module.exports = service;
