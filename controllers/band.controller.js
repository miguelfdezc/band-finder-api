'use strict';

let AuthService = require('../services/auth.service');
let BandService = require('../services/band.service');

const controller = {
  createBand: async function (req, res) {
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

      let user = await AuthService.getUserById(req.body.usuario);
      if (!user) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el usuario',
        });
      }

      let band = await BandService.createBand(req.body);
      if (!band) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido guardar la banda',
        });
      } else {
        return res.status(200).send({ band });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  readBand: async function (req, res) {
    try {
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id de la banda es un parametro obligatorio',
        });
      }
      let band = await BandService.readBand(req.params.id);
      if (!band) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar la banda',
        });
      } else {
        return res.status(200).send({ band });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  getBandsLength: async function (req, res) {
    try {
      let length = await BandService.getBandsLength();
      if (!length) {
        return res.status(404).send({
          message: 'Not Found: no se han podido contar las bandas',
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
  readBands: async function (req, res) {
    try {
      const { offset, limit } = req.query;
      let bands = await BandService.readBands(
        Number(offset ?? 0),
        Number(limit ?? 0)
      );
      if (!bands) {
        return res.status(404).send({
          message: 'Not Found: no se han podido encontrar las bandas',
        });
      } else {
        return res.status(200).send({ bands });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  readBandsByFounder: async function (req, res) {
    try {
      if (typeof req.params.uid === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del usuario es un parametro obligatorio',
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
              'Forbidden: el usuario actual no tiene permisos para leer bandas',
          });
        }
      }

      let bands = await BandService.readBandsByFounder(req.query.uid);
      if (!bands) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar las bandas',
        });
      } else {
        return res.status(200).send({ bands });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  submitApplication: async function (req, res) {
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
          message: 'Bad Request: el id de la banda es un parametro obligatorio',
        });
      }

      let user = await AuthService.getUserById(req.body.usuario);
      if (!user) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el usuario',
        });
      }
      let band = await BandService.readBand(req.params.id);
      if (!band) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar la banda',
        });
      }

      let application = await BandService.submitApplication(
        req.body,
        req.params.id
      );
      if (!application) {
        return res.status(404).send({
          message:
            'Not Found: no se ha podido enviar la aplicación para la banda',
        });
      } else {
        return res.status(200).send({ application });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  updateMembers: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id de la banda es un parametro obligatorio',
        });
      }
      if (typeof req.query.uid === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del usuario es un parametro obligatorio',
        });
      }

      let readBand = await BandService.readBand(req.params.id);
      if (!readBand) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar la banda',
        });
      }

      let user = await AuthService.getUserById(req.query.uid);
      if (!user) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el usuario',
        });
      }

      const isAdmin = await AuthService.checkAdmin(req.query.uid);
      if (!isAdmin) {
        if (user.uid !== readBand.fundador.usuario) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos para editar esta banda',
          });
        }
      }

      let band = await BandService.updateMembers(req.body, req.params.id);
      if (!band) {
        return res.status(404).send({
          message:
            'Not Found: no se han podido modificar los miembros de la banda',
        });
      } else {
        return res.status(200).send({ band });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  updateBand: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id de la banda es un parametro obligatorio',
        });
      }
      if (typeof req.body.usuario === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del usuario es un parametro obligatorio',
        });
      }

      let readBand = await BandService.readBand(req.params.id);
      if (!readBand) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar la banda',
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
        if (user.uid !== readBand.fundador.usuario) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos para editar esta banda',
          });
        }
      }

      let band = await BandService.updateBand(req.body, req.params.id);
      if (!band) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido modificar la banda',
        });
      } else {
        return res.status(200).send({ band });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  deleteBand: async function (req, res) {
    try {
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id de la banda es un parametro obligatorio',
        });
      }
      if (typeof req.query.uid === 'undefined') {
        return res.status(401).send({
          message:
            'Unauthorized: el uid es obligatorio para verificar los permisos del usuario',
        });
      }

      let readBand = await BandService.readBand(req.params.id);
      if (!readBand) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el evento',
        });
      }

      const isAdmin = await AuthService.checkAdmin(req.query.uid);
      if (!isAdmin) {
        if (req.query.uid !== readBand.fundador.usuario) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos para eliminar esta banda',
          });
        }
      }

      let band = await BandService.deleteBand(req.params.id);
      if (!band) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido eliminar la banda',
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
