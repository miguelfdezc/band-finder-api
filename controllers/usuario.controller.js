'use strict';

let UsuarioService = require('../services/usuario.service');
let AutenticacionService = require('../services/autenticacion.service');

const controller = {
  readUsuario: async function (req, res) {
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
            'Unauthorized: el uid es obligatorio para verificar el usuario',
        });
      }
      if (req.params.uid !== req.query.uid) {
        const isAdmin = await AutenticacionService.checkAdmin(req.query.uid);
        if (!isAdmin) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos de administrador',
          });
        }
      }

      let userWithClaims = await UsuarioService.getUsuarioById(req.params.uid);
      if (!userWithClaims) {
        return res
          .status(404)
          .send({ message: 'Not Found: no se ha podido obtener el usuario' });
      }

      let userDB = await UsuarioService.getUsuarioFromDB(
        userWithClaims.customClaims.tipo,
        req.params.uid
      );
      if (!userDB) {
        return res
          .status(404)
          .send({ message: 'Not Found: no se ha podido obtener el usuario' });
      }

      return res.status(200).send({ user: { ...userWithClaims, ...userDB } });
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
};

module.exports = controller;
