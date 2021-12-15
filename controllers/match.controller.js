'use strict';

let AuthService = require('../services/auth.service');
let MatchService = require('../services/match.service');

const controller = {
  matchBand: async function (req, res) {
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

      let match = await MatchService.matchBand(req.body);
      if (!match) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido emparejar al usuario con bandas',
        });
      } else {
        return res.status(200).send({ match });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
};

module.exports = controller;
