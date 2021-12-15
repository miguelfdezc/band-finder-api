'use strict';

const { db } = require('./firebase.service');
let UserService = require('./user.service');

const service = {
  createBand: async function ({
    usuario,
    nombre,
    descripcion,
    nivel,
    fechaFundacion,
    ubicacion,
    ciudad,
    generos,
    instrumentos,
    imagenPerfil,
    imagenFondo,
    actuaciones,
    valoracion,
    fans,
  }) {
    let membersDB = null;
    try {
      const user = await UserService.readUser(usuario);
      const fundador = {
        usuario,
        username: user.usuario,
        email: user.email,
        nombre: user.displayName,
      };

      const band = await db.collection('bandas').add({
        fundador,
        nombre,
        descripcion,
        nivel,
        fechaFundacion,
        ubicacion,
        ciudad,
        generos,
        instrumentos,
        imagenPerfil,
        imagenFondo,
        actuaciones,
        valoracion,
        fans,
      });
      const bandData = await band.get();

      const membersRef = db
        .collection('bandas')
        .doc(band.id)
        .collection('miembros')
        .doc();

      membersDB = {
        usuario,
        username: user.usuario,
        userImg: user.photoURL,
        instrumento: null,
      };

      await membersRef.set(membersDB);
      membersDB = await membersRef.get();

      return { id: band.id, ...bandData.data(), miembros: [membersDB.data()] };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readBand: async function (id) {
    let bandDB = null;
    try {
      const bandRef = db.collection('bandas').doc(id);

      bandDB = await bandRef.get();

      const miembros = await this.readMembers(id);
      const aplicaciones = await this.readApplications(id);

      return {
        id: bandRef.id,
        ...bandDB.data(),
        miembros: miembros ?? [],
        aplicaciones: aplicaciones ?? [],
      };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readMembers: async function (band) {
    try {
      const members = await db
        .collection('bandas')
        .doc(band)
        .collection('miembros')
        .get();

      return members.docs.map((doc) => doc.data());
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readApplications: async function (band) {
    try {
      const applications = await db
        .collection('bandas')
        .doc(band)
        .collection('aplicaciones')
        .get();

      return applications.docs.map((doc) => doc.data());
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  getBandsLength: async function () {
    try {
      const allBands = await db.collection('bandas').select('nombre').get();
      return allBands.docs.length;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readBands: async function (offset, limit) {
    try {
      console.log('OFFSET:', offset);
      console.log('LIMIT:', limit);
      let bands = [];

      bands = await db.collection('bandas').offset(offset).limit(limit).get();

      bands = bands.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      console.log('BANDS:', bands.length);

      for (let i = 0; i < bands.length; i++) {
        const miembros = await this.readMembers(bands[i].id);
        const aplicaciones = await this.readApplications(bands[i].id);
        bands[i].miembros = miembros;
        bands[i].aplicaciones = aplicaciones;
      }

      return bands;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  submitApplication: async function ({ usuario: uid, texto }, band) {
    let applicationDB = null;
    try {
      const applicationRef = db
        .collection('bandas')
        .doc(band)
        .collection('aplicaciones');

      const snapshot = await applicationRef
        .where('usuario', '==', uid)
        .limit(1)
        .get();

      if (snapshot.empty) {
        const user = await UserService.readUser(uid);

        applicationDB = {
          usuario: uid,
          username: user.usuario,
          userImg: user.photoURL,
          texto,
        };

        await applicationRef.add(applicationDB);
      }

      applicationDB = await (
        await applicationRef.get()
      ).docs.map((doc) => doc.data())[0];

      return applicationDB;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  updateMembers: async function ({ usuario, aceptado, instrumento }, band) {
    let membersDB = null;
    try {
      const membersRef = db
        .collection('bandas')
        .doc(band)
        .collection('miembros')
        .doc();
      const applicationsRef = db
        .collection('bandas')
        .doc(band)
        .collection('aplicaciones');

      const snapshot = await applicationsRef
        .where('usuario', '==', usuario)
        .limit(1)
        .get();

      if (!snapshot.empty) snapshot.docs.map((doc) => doc.ref)[0].delete();

      if (aceptado) {
        const user = await UserService.readUser(usuario);
        membersDB = {
          usuario,
          username: user.usuario,
          userImg: user.photoURL,
          instrumento: instrumento,
        };

        await membersRef.create(membersDB);
      }

      membersDB = await this.readMembers(band);

      return membersDB;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  updateBand: async function (
    {
      usuario,
      nombre,
      descripcion,
      nivel,
      fechaFundacion,
      ubicacion,
      ciudad,
      generos,
      instrumentos,
      imagenPerfil,
      imagenFondo,
      actuaciones,
      valoracion,
      fans,
    },
    id
  ) {
    let bandDB = null;
    try {
      const user = await UserService.readUser(usuario);
      const fundador = {
        usuario,
        username: user.usuario,
        email: user.email,
        nombre: user.displayName,
      };

      const bandRef = db.collection('bandas').doc(id);

      const fieldsToEdit = Object.fromEntries(
        Object.entries({
          fundador,
          nombre,
          descripcion,
          nivel,
          fechaFundacion,
          ubicacion,
          ciudad,
          generos,
          instrumentos,
          imagenPerfil,
          imagenFondo,
          actuaciones,
          valoracion,
          fans,
        }).filter(([key, value]) => !!value)
      );

      await bandRef.update(fieldsToEdit);

      bandDB = await bandRef.get();

      return bandDB.data();
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  deleteBand: async function (id) {
    try {
      const bandRef = db.collection('bandas').doc(id);

      let isMembersDeleted = false;

      await db
        .collection('bandas')
        .doc(id)
        .collection('miembros')
        .get()
        .then(async (querySnapshot) => {
          await querySnapshot.forEach(async (doc) => {
            await doc.ref.delete();
          });
          isMembersDeleted = true;
        });
      await db
        .collection('bandas')
        .doc(id)
        .collection('aplicaciones')
        .get()
        .then(async (querySnapshot) => {
          await querySnapshot.forEach(async (doc) => {
            await doc.ref.delete();
          });
          isApplicationsDeleted = true;
        });

      let isDBbandDeleted = false;

      if (isMembersDeleted && isApplicationsDeleted) {
        isDBbandDeleted = await !!bandRef.delete();
      }

      return isMembersDeleted && isApplicationsDeleted && isDBbandDeleted;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
};

module.exports = service;
