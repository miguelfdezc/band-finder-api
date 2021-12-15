'use strict';

let AuthService = require('../services/auth.service');

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
      let isAdmin = await AuthService.checkAdminByEmail(req.body.email);
      if (isAdmin === undefined) {
        return res.status(404).send({
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
};

module.exports = controller;
