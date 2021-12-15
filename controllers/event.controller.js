'use strict';

let AuthService = require('../services/auth.service');
let EventService = require('../services/event.service');

const controller = {
  createEvent: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (typeof req.body.usuario === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del usuario es un parametro obligatorio',
        });
      }
      if (typeof req.body.tipo === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el tipo de evento es un parametro obligatorio',
        });
      } else if (
        req.body.tipo !== 'puntual' &&
        req.body.tipo !== 'diario' &&
        req.body.tipo !== 'semanal' &&
        req.body.tipo !== 'mensual'
      ) {
        return res.status(400).send({
          message: 'Bad Request: el tipo de evento no es válido',
        });
      }

      let user = await AuthService.getUserById(req.body.usuario);
      if (!user) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el usuario',
        });
      }

      let event = await EventService.createEvent(req.body);
      if (!event) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido guardar el evento',
        });
      } else {
        return res.status(200).send({ event });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  readEvent: async function (req, res) {
    try {
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del evento es un parametro obligatorio',
        });
      }
      let event = await EventService.readEvent(req.params.id);
      if (!event) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el evento',
        });
      } else {
        return res.status(200).send({ event });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  getEventsLength: async function (req, res) {
    try {
      let length = await EventService.getEventsLength();
      if (!length) {
        return res.status(404).send({
          message: 'Not Found: no se han podido contar los eventos',
        });
      } else {
        return res.status(200).send({ length });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  readEvents: async function (req, res) {
    try {
      const { offset, limit } = req.query;
      let events = await EventService.readEvents(Number(offset), Number(limit));
      if (!events) {
        return res.status(404).send({
          message: 'Not Found: no se han podido encontrar los eventos',
        });
      } else {
        return res.status(200).send({ events });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  readEventsByUser: async function (req, res) {
    try {
      if (typeof req.params.uid === 'undefined') {
        return res.status(400).send({
          message:
            'Bad Request: el uid del usuario es un parametro obligatorio',
        });
      }
      if (typeof req.query.uid === 'undefined') {
        return res.status(401).send({
          message:
            'Unauthorized: el uid es obligatorio para verificar los permisos del usuario',
        });
      }

      let user = await AuthService.getUserById(req.params.uid);
      if (!user) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el usuario',
        });
      }

      const isAdmin = await AuthService.checkAdmin(req.query.uid);
      if (!isAdmin) {
        if (req.params.uid !== req.query.uid) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos para leer este evento',
          });
        }
      }

      let events = await EventService.readEventsByUser(req.query.uid);
      if (!events) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar los eventos',
        });
      } else {
        return res.status(200).send({ events });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  readEventsSubscribed: async function (req, res) {
    try {
      if (typeof req.params.uid === 'undefined') {
        return res.status(400).send({
          message:
            'Bad Request: el uid del usuario es un parametro obligatorio',
        });
      }

      let user = await AuthService.getUserById(req.params.uid);
      if (!user) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el usuario',
        });
      }

      let events = await EventService.readEventsSubscribed(req.params.uid);
      if (!events) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar los eventos',
        });
      } else {
        return res.status(200).send({ events });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  updateSubscribed: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (typeof req.body.usuario === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del usuario es un parametro obligatorio',
        });
      }
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message:
            'Bad Request: el id de el evento es un parametro obligatorio',
        });
      }

      let user = await AuthService.getUserById(req.body.usuario);
      if (!user) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el usuario',
        });
      }
      let readEvent = await EventService.readEvent(req.params.id);
      if (!readEvent) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el evento',
        });
      }

      let availableDate = readEvent.fechas.includes(req.body.fecha);
      if (!availableDate) {
        return res.status(404).send({
          message: 'Not Found: la fecha no está disponible',
        });
      }

      let event = await EventService.updateSubscribed(req.body, req.params.id);
      if (!event) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido suscribir al evento',
        });
      } else {
        return res.status(200).send({ event });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  updateEvent: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del evento es un parametro obligatorio',
        });
      }
      if (typeof req.body.usuario === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del usuario es un parametro obligatorio',
        });
      }

      let readEvent = await EventService.readEvent(req.params.id);
      if (!readEvent) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el evento',
        });
      }

      let user = await AuthService.getUserById(req.body.usuario);
      if (!user) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el usuario',
        });
      }

      const isAdmin = await AuthService.checkAdmin(req.body.usuario);
      if (!isAdmin) {
        if (user.uid !== readEvent.usuario) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos para editar este evento',
          });
        }
      }

      let event = await EventService.updateEvent(req.body, req.params.id);
      if (!event) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido modificar el evento',
        });
      } else {
        return res.status(200).send({ event });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  deleteEvent: async function (req, res) {
    try {
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del evento es un parametro obligatorio',
        });
      }
      if (typeof req.query.uid === 'undefined') {
        return res.status(401).send({
          message:
            'Unauthorized: el uid es obligatorio para verificar los permisos del usuario',
        });
      }

      let readEvent = await EventService.readEvent(req.params.id);
      if (!readEvent) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el evento',
        });
      }

      const isAdmin = await AuthService.checkAdmin(req.query.uid);
      if (!isAdmin) {
        if (req.query.uid !== readEvent.usuario) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos para eliminar este evento',
          });
        }
      }

      let event = await EventService.deleteEvent(req.params.id);
      if (!event) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido eliminar el evento',
        });
      } else {
        return res.status(200).send({ message: 'OK', id: req.params.id });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
};

module.exports = controller;
