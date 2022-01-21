'use strict';

const moment = require('moment');
const { db } = require('./firebase.service');
let UserService = require('./user.service');

const service = {
  createEvent: async function ({
    usuario,
    descripcion,
    tipo,
    imagen,
    fechaInicio,
    fechaFin,
    horaInicio,
    horaFin,
    ubicacion,
  }) {
    try {
      const fechas = await this.getEventDates(tipo, fechaInicio, fechaFin);

      const event = await db.collection('eventos').add({
        usuario,
        descripcion,
        tipo,
        imagen,
        fechaInicio,
        fechaFin,
        horaInicio,
        horaFin,
        ubicacion,
        fechas,
      });
      const eventData = await event.get();

      return { id: event.id, ...eventData.data() };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  getEventDates: async function (tipo, fechaInicio, fechaFin) {
    try {
      let daysOfYear = [];

      const initDate = moment(fechaInicio, 'DD/MM/YYYY');
      const endDate = moment(fechaFin, 'DD/MM/YYYY');

      switch (tipo) {
        case 'puntual':
          let m = moment(initDate);
          daysOfYear.push(m.format('DD/MM/YYYY'));
          break;
        case 'diario':
          for (
            let m = moment(initDate);
            m.diff(endDate, 'days') <= 0;
            m.add(1, 'days')
          ) {
            daysOfYear.push(m.format('DD/MM/YYYY'));
          }
          break;
        case 'semanal':
          for (
            let m = moment(initDate);
            m.diff(endDate, 'days') <= 0;
            m.add(7, 'days')
          ) {
            daysOfYear.push(m.format('DD/MM/YYYY'));
          }
          break;
        case 'mensual':
          for (
            let m = moment(initDate);
            m.diff(endDate, 'days') <= 0;
            m.add(1, 'months')
          ) {
            daysOfYear.push(m.format('DD/MM/YYYY'));
          }
          break;
        default:
          break;
      }

      return daysOfYear;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readEvent: async function (id) {
    let eventDB = null;
    try {
      const eventRef = db.collection('eventos').doc(id);

      eventDB = await eventRef.get();

      const assistants = await this.readAssistants(id);

      return { id: eventRef.id, ...eventDB.data(), asistentes: assistants };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readAssistants: async function (event) {
    try {
      const assistants = await db
        .collection('eventos')
        .doc(event)
        .collection('asistentes')
        .get();

      return assistants.docs.map((doc) => doc.data());
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  getEventsLength: async function () {
    try {
      const allEvents = await db.collection('eventos').select('usuario').get();
      return allEvents.docs.length;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readEvents: async function (offset = 0, limit) {
    try {
      let events = [];

      if (!limit) events = await db.collection('eventos').offset(offset).get();
      else
        events = await db
          .collection('eventos')
          .offset(offset)
          .limit(limit)
          .get();

      events = events.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });

      for (let i = 0; i < events.length; i++) {
        const asistentes = await this.readAssistants(events[i].id);
        events[i].asistentes = asistentes;
      }

      return events;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readEventsByUser: async function (uid) {
    try {
      const eventsRef = db.collection('eventos');
      const snapshot = await eventsRef.where('usuario', '==', uid).get();

      if (snapshot.empty) {
        return [];
      }

      let events = [];

      const usuario = await UserService.readUser(uid);

      snapshot.forEach(async (doc) => {
        events.push({
          id: doc.id,
          username: usuario.usuario,
          userImg: usuario.imagenPerfil,
          ...doc.data(),
        });
      });

      for (let i = 0; i < events.length; i++) {
        const asistentes = await this.readAssistants(events[i].id);
        events[i].asistentes = asistentes;
      }

      return events;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readEventsSubscribed: async function (uid) {
    try {
      let readEvents = await this.readEvents();
      let events = readEvents.filter((event) =>
        event.asistentes.find((asistente) => asistente.usuario === uid)
      );
      return events;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  updateSubscribed: async function ({ usuario, fecha }, id) {
    let eventDB = null;
    try {
      const assistantRef = db
        .collection('eventos')
        .doc(id)
        .collection('asistentes');

      const snapshot = await assistantRef
        .where('usuario', '==', usuario)
        .where('fecha', '==', fecha)
        .get();

      if (snapshot.empty) {
        assistantRef.doc().create({ usuario, fecha });
      } else {
        snapshot.forEach((doc) => {
          assistantRef.doc(doc.id).delete();
        });
      }

      eventDB = await this.readEvent(id);

      return eventDB;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  updateEvent: async function (
    {
      usuario,
      descripcion,
      tipo,
      imagen,
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      ubicacion,
    },
    id
  ) {
    let eventDB = null;
    try {
      const eventRef = db.collection('eventos').doc(id);

      const fieldsToEdit = Object.fromEntries(
        Object.entries({
          usuario,
          descripcion,
          tipo,
          imagen,
          fechaInicio,
          fechaFin,
          horaInicio,
          horaFin,
          ubicacion,
        }).filter(([key, value]) => !!value)
      );

      await eventRef.update(fieldsToEdit);

      eventDB = await eventRef.get();

      return eventDB.data();
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  deleteEvent: async function (id) {
    try {
      const eventRef = db.collection('eventos').doc(id);

      let isAssistantsDeleted = false;

      await db
        .collection('eventos')
        .doc(id)
        .collection('asistentes')
        .get()
        .then(async (querySnapshot) => {
          await querySnapshot.forEach(async (doc) => {
            await doc.ref.delete();
          });
          isAssistantsDeleted = true;
        });

      let isDBeventDeleted = false;

      if (isAssistantsDeleted) {
        isDBeventDeleted = await !!eventRef.delete();
      }

      return isAssistantsDeleted && isDBeventDeleted;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
};

service.getEventDates('mensual', '01/01/2021', '01/01/2022');

module.exports = service;
