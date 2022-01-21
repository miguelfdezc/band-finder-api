'use strict';

let AuthService = require('../services/auth.service');
let UserService = require('../services/user.service');

const controller = {
  createUser: async function (req, res) {
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
          const isAdmin = await AuthService.checkAdmin(req.query.uid);
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
      let user = await UserService.createUser(req.body, req.params.collection);
      if (!user) {
        return res
          .status(404)
          .send({ message: 'Not Found: no se ha podido registrar el usuario' });
      } else {
        return res.status(201).send({ user });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  readUser: async function (req, res) {
    try {
      if (
        typeof req.params.uid === 'undefined' ||
        typeof req.query.uid === 'undefined'
      ) {
        return res.status(401).send({
          message:
            'Unauthorized: el uid es obligatorio para verificar los permisos de administrador',
        });
      }
      /* if (req.params.uid !== req.query.uid) {
        const isAdmin = await AuthService.checkAdmin(req.query.uid);
        if (!isAdmin) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos de administrador',
          });
        }
      } */

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
  getMusiciansLength: async function (req, res) {
    try {
      let length = await UserService.getMusiciansLength();
      if (!length) {
        return res.status(404).send({
          message: 'Not Found: no se han podido contar los músicos',
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
  getBusinessesLength: async function (req, res) {
    try {
      let length = await UserService.getBusinessesLength();
      if (!length) {
        return res.status(404).send({
          message: 'Not Found: no se han podido contar los negocios',
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
  readUsers: async function (req, res) {
    try {
      const { offset, limit } = req.query;
      if (typeof req.params.type === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el tipo de usuario es obligatorio',
        });
      }
      if (typeof req.query.uid === 'undefined') {
        return res.status(401).send({
          message:
            'Unauthorized: el uid es obligatorio para verificar los permisos de administrador',
        });
      }
      const isAdmin = await AuthService.checkAdmin(req.query.uid);
      if (!isAdmin) {
        return res.status(403).send({
          message:
            'Forbidden: el usuario actual no tiene permisos de administrador',
        });
      }

      let users = await UserService.readUsers(
        req.params.type,
        Number(offset ?? 0),
        Number(limit ?? 0)
      );
      if (!users) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar los usuarios',
        });
      } else {
        return res.status(200).send({ users });
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
  updateFans: async function (req, res) {
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

      let user = await UserService.updateFans(req.body, req.params.uid);
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
  deleteUser: async function (req, res) {
    try {
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

      let user = await UserService.deleteUser(req.params.uid);
      if (!user) {
        return res
          .status(404)
          .send({ message: 'Not Found: no se ha podido eliminar el usuario' });
      } else {
        return res.status(200).send({ message: 'OK' });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
};

module.exports = controller;
