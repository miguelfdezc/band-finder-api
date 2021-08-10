'use strict';

let AuthService = require('../services/auth.service');
let PostService = require('../services/post.service');

const controller = {
  createPost: async function (req, res) {
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

      let post = await PostService.createPost(req.body);
      if (!post) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido guardar la publicación',
        });
      } else {
        return res.status(200).send({ post });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  addComment: async function (req, res) {
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
          message:
            'Bad Request: el id de la publicación es un parametro obligatorio',
        });
      }

      let user = await AuthService.getUserById(req.body.usuario);
      if (!user) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el usuario',
        });
      }
      let post = await PostService.readPost(req.params.id);
      if (!post) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar la publicación',
        });
      }

      let comment = await PostService.addComment(req.body, req.params.id);
      if (!comment) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido guardar el comentario',
        });
      } else {
        return res.status(200).send({ comment });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  readPost: async function (req, res) {
    try {
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del post es un parametro obligatorio',
        });
      }
      let post = await PostService.readPost(req.params.id);
      if (!post) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar la publicación',
        });
      } else {
        return res.status(200).send({ post });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  readPostsByUser: async function (req, res) {
    try {
      if (typeof req.params.uid === 'undefined') {
        return res.status(400).send({
          message:
            'Bad Request: el uid del usuario es un parametro obligatorio',
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
              'Forbidden: el usuario actual no tiene permisos para editar esta publicación',
          });
        }
      }

      let posts = await PostService.readPostsByUser(req.query.uid);
      if (!posts) {
        return res.status(404).send({
          message: 'Not Found: no se han podido encontrar las publicaciones',
        });
      } else {
        return res.status(200).send({ posts });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  updateLikes: async function (req, res) {
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
          message:
            'Bad Request: el id de la publicación es un parametro obligatorio',
        });
      }

      let user = await AuthService.getUserById(req.body.usuario);
      if (!user) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar el usuario',
        });
      }
      let post = await PostService.readPost(req.params.id);
      if (!post) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar la publicación',
        });
      }

      let likes = await PostService.updateLikes(req.body, req.params.id);
      if (!likes) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido dar me gusta a la publicación',
        });
      } else {
        return res.status(200).send({ likes });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  updateShared: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message:
            'Bad Request: el id de la publicación es un parametro obligatorio',
        });
      }

      let post = await PostService.readPost(req.params.id);
      if (!post) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar la publicación',
        });
      }

      let shared = await PostService.updateShared(req.params.id);
      if (!shared) {
        return res.status(404).send({
          message:
            'Not Found: no se ha podido dar a compartir a la publicación',
        });
      } else {
        return res.status(200).send({ shared });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  updatePost: async function (req, res) {
    try {
      if (typeof req.body === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el cuerpo de la peticion esta vacio',
        });
      }
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del post es un parametro obligatorio',
        });
      }
      if (typeof req.body.usuario === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del usuario es un parametro obligatorio',
        });
      }

      let readPost = await PostService.readPost(req.params.id);
      if (!readPost) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar la publicación',
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
        if (user.uid !== readPost.usuario) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos para editar esta publicación',
          });
        }
      }

      let post = await PostService.updatePost(req.body, req.params.id);
      if (!post) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido modificar la publicación',
        });
      } else {
        return res.status(200).send({ post });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Internal Server Error: ${err.message}`, error: err });
    }
  },
  deletePost: async function (req, res) {
    try {
      if (typeof req.params.id === 'undefined') {
        return res.status(400).send({
          message: 'Bad Request: el id del post es un parametro obligatorio',
        });
      }
      if (typeof req.query.uid === 'undefined') {
        return res.status(401).send({
          message:
            'Unauthorized: el uid es obligatorio para verificar los permisos del usuario',
        });
      }

      let readPost = await PostService.readPost(req.params.id);
      if (!readPost) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido encontrar la publicación',
        });
      }

      const isAdmin = await AuthService.checkAdmin(req.query.uid);
      if (!isAdmin) {
        if (req.query.uid !== readPost.usuario) {
          return res.status(403).send({
            message:
              'Forbidden: el usuario actual no tiene permisos para eliminar esta publicación',
          });
        }
      }

      let post = await PostService.deletePost(req.params.id);
      if (!post) {
        return res.status(404).send({
          message: 'Not Found: no se ha podido eliminar la publicación',
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
