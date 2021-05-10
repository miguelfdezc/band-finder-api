'use strict';

let ExampleService = require('../services/example.service');

const controller = {
  holaMundo: async function (req, res) {
    try {
      let message = await ExampleService.holaMundo();
      if (!message) {
        return res
          .status(404)
          .send({ message: 'No se ha podido devolver Hola Mundo' });
      } else {
        return res.status(201).send({ message });
      }
    } catch (err) {
      return res.status(500).send({ message: err.message, error: err });
    }
  },
};

module.exports = controller;
