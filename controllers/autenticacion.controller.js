'use strict';

let AutenticacionService = require('../services/autenticacion.service');

const controller = {
  register: async function (req, res) {
    try {
      let user = await AutenticacionService.createUser(req.body);
      if (!user) {
        return res
          .status(404)
          .send({ message: 'No se ha podido registrar el usuario' });
      } else {
        return res.status(200).send({ user });
      }
    } catch (err) {
      return res.status(500).send({ message: err.message, error: err });
    }
  },
};

module.exports = controller;
