'use strict';

let AuthService = require('../services/auth.service');
let UserService = require('../services/user.service');

const controller = {
  readUser: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (
        typeof req.params.uid === 'undefined' ||
        typeof req.query.uid === 'undefined'
      ) {
        return res.status(401).send({
          message:
            'Unauthorized: el uid es obligatorio para verificar los permisos de administrador',
        });
      }
      if (req.params.uid !== req.query.uid) {
        const isAdmin = await AuthService.checkAdmin(req.query.uid);
        if (!isAdmin) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos de administrador',
          });
        }
      }

      let user = await UserService.readUser(req.params.uid);
      if (!user) {
        return res
          .status(404)
          .send({ message: 'Not Found: no se ha podido encontrar el usuario' });
      } else {
        return res.status(200).send({ user });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  updateUser: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (
        typeof req.params.uid === 'undefined' ||
        typeof req.query.uid === 'undefined'
      ) {
        return res.status(401).send({
          message:
            'Unauthorized: el uid es obligatorio para verificar los permisos de administrador',
        });
      }
      if (req.params.uid !== req.query.uid) {
        const isAdmin = await AuthService.checkAdmin(req.query.uid);
        if (!isAdmin) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos de administrador',
          });
        }
      }

      let user = await UserService.updateUser(req.body, req.params.uid);
      if (!user) {
        return res
          .status(404)
          .send({ message: 'Not Found: no se ha podido encontrar el usuario' });
      } else {
        return res.status(200).send({ user });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
};

module.exports = controller;
