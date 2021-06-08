'use strict';

const admin = require('./firebase.service');

const service = {
  createUser: async function ({
    email,
    emailVerified,
    phoneNumber,
    password,
    displayName,
    photoURL,
    disabled,
  }) {
    try {
      const user = await admin.auth().createUser({
        email,
        emailVerified,
        phoneNumber,
        password,
        displayName,
        photoURL,
        disabled,
      });

      await admin.auth().setCustomUserClaims(user.uid, {
        admin: true,
        cocheFavorito: 'Lamborghini Aventador GT 360 Plus Pro',
      });

      const userWithClaims = await admin.auth().getUser(user.uid);

      return userWithClaims;
    } catch (err) {
      throw new Error('Error al crear el usuario');
    }
  },
};

module.exports = service;
