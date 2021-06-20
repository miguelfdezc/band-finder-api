'use strict';

let AutenticacionService = require('../services/autenticacion.service');

const controller = {
  checkAdmin: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (typeof req.body.email === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el email es un parametro obligatorio',
        });
      }
      let isAdmin = await AutenticacionService.checkAdminByEmail(
        req.body.email
      );
      if (isAdmin === undefined) {
        return res
          .status(404)
          .send({
            message:
              'Not Found: no se ha podido comprobar los permisos de administrador del usuario',
          });
      } else {
        return res.status(200).send({ isAdmin });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  register: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (typeof req.params.collection === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: la coleccion es un parametro obligatorio',
        });
      } else if (req.params.collection === 'administradores') {
        if (typeof req.query.uid === 'undefined') {
          return res.status(401).send({
            message:
              'Unauthorized: el uid es obligatorio para verificar los permisos de administrador',
          });
        } else {
          const isAdmin = await AutenticacionService.checkAdmin(req.query.uid);
          if (!isAdmin) {
            return res.status(403).send({
              message:
                'Forbidden: el usuario actual no tiene permisos de administrador',
            });
          }
        }
      } else if (
        req.params.collection !== 'musicos' &&
        req.params.collection !== 'negocios'
      ) {
        return res.status(404).send({
          message: 'Not Found: no se ha encontrado el tipo de usuario a crear',
        });
      }
      let user = await AutenticacionService.createUsuario(
        req.body,
        req.params.collection
      );
      if (!user) {
        return res
          .status(404)
          .send({ message: 'Not Found: no se ha podido registrar el usuario' });
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
