'use strict';

const { admin, db } = require('./firebase.service');

const service = {
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
  updateUser: async function (
    {
      email,
      phoneNumber,
      emailVerified,
      password,
      displayName,
      photoURL,
      disabled,
      actuaciones,
      descripcion,
      fans,
      imagenFondo,
      ubicacion,
      usuario,
      valoracion,
    },
    uid
  ) {
    let userDB = null;
    try {
      const userEdited = await admin.auth().updateUser(uid, {
        email,
        phoneNumber,
        emailVerified,
        password,
        displayName,
        photoURL,
        disabled,
      });

      console.log(userEdited);

      const userRef = db.collection(userEdited.customClaims.type).doc(uid);

      const fieldsToEdit = Object.fromEntries(
        Object.entries({
          actuaciones,
          descripcion,
          fans,
          imagenFondo,
          ubicacion,
          usuario,
          valoracion,
        }).filter(([key, value]) => !!value)
      );

      await userRef.update(fieldsToEdit);

      userDB = await userRef.get();

      return { ...userEdited, ...userDB.data() };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
};

module.exports = service;
