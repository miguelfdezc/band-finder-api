'use strict';

const service = {
  holaMundo: async function () {
    try {
      let message = 'Hola Mundo';
      return message;
    } catch (err) {
      throw new Error('Error al devolver Hola Mundo');
    }
  },
};

module.exports = service;
