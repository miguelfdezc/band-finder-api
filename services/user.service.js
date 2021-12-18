'use strict';

const { admin, db } = require('./firebase.service');
let AuthService = require('./auth.service');

const service = {
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
          fans: [],
          seguidos: [],
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
  readUser: async function (uid) {
    let userDB = null;
    try {
      const userWithClaims = await admin.auth().getUser(uid);

      const userRef = db.collection(userWithClaims.customClaims.type).doc(uid);

      userDB = await userRef.get();

      return { ...userWithClaims, ...userDB.data() };
    } catch (err) {
      if (err.errorInfo.code === 'auth/user-not-found') return null;
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  getMusiciansLength: async function () {
    try {
      const allMusicians = await db
        .collection('musicos')
        .select('usuario')
        .get();
      return allMusicians.docs.length;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  getBusinessesLength: async function () {
    try {
      const allBusinesses = await db
        .collection('negocios')
        .select('usuario')
        .get();
      return allBusinesses.docs.length;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readUsers: async function (type, offset = 0, limit) {
    let usersDB = null;
    try {
      const usersWithClaims = await (await admin.auth().listUsers()).users;

      if (!limit) usersDB = await db.collection(type).offset(offset).get();
      else
        usersDB = await db.collection(type).offset(offset).limit(limit).get();

      const users = usersDB.docs.map((doc) => {
        return {
          ...usersWithClaims.find((user) => user.uid === doc.id),
          ...doc.data(),
        };
      });

      return users;
    } catch (err) {
      console.trace(err);
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
      seguidos,
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

      const userRef = db.collection(userEdited.customClaims.type).doc(uid);

      const fieldsToEdit = Object.fromEntries(
        Object.entries({
          actuaciones,
          descripcion,
          fans,
          seguidos,
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
  updateFans: async function ({ usuario }, uid) {
    let userFollowedDB = null,
      userFollowingDB = null;
    try {
      const userFollowed = await admin.auth().getUser(usuario);
      const userFollowing = await admin.auth().getUser(uid);

      const userFollowedRef = db
        .collection(userFollowed.customClaims.type)
        .doc(usuario);
      const userFollowingRef = db
        .collection(userFollowing.customClaims.type)
        .doc(uid);

      userFollowedDB = await (await userFollowedRef.get()).data();
      userFollowingDB = await (await userFollowingRef.get()).data();

      if (userFollowedDB.fans.includes(uid))
        await userFollowedRef.update({
          fans: [...userFollowedDB.fans.filter((f) => f !== uid)],
        });
      else {
        await userFollowedRef.update({
          fans: [...userFollowedDB.fans, uid],
        });
      }

      if (userFollowingDB.seguidos.includes(usuario)) {
        await userFollowingRef.update({
          seguidos: [...userFollowingDB.seguidos.filter((f) => f !== usuario)],
        });
      } else {
        await userFollowingRef.update({
          seguidos: [...userFollowingDB.seguidos, usuario],
        });
      }

      userFollowedDB = await userFollowedRef.get();
      userFollowingDB = await userFollowingRef.get();

      return {
        userFollowed: { ...userFollowed, ...userFollowedDB.data() },
        userFollowing: { ...userFollowing, ...userFollowingDB.data() },
      };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  deleteUser: async function (uid) {
    try {
      const user = await AuthService.getUserById(uid);

      const userRef = db.collection(user.customClaims.type).doc(uid);
      const isDBuserDeleted = await !!userRef.delete();

      let isAuthUserDeleted = false;

      if (!!isDBuserDeleted)
        await admin
          .auth()
          .deleteUser(uid)
          .then(() => (isAuthUserDeleted = true))
          .catch(() => (isAuthUserDeleted = false));

      return isAuthUserDeleted && isDBuserDeleted;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
};

module.exports = service;
