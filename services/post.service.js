'use strict';

const { admin, db } = require('./firebase.service');
let AuthService = require('./auth.service');

const service = {
  createPost: async function ({ usuario, imagen, video, descripcion }) {
    try {
      const post = await db.collection('publicaciones').add({
        usuario,
        imagen: imagen ?? '',
        video: video ?? '',
        descripcion,
        likes: 0,
        shared: 0,
      });
      const postData = await post.get();

      return { id: post.id, ...postData.data() };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  addComment: async function ({ usuario, texto }, post) {
    let commentDB = null;
    try {
      const commentRef = db
        .collection('publicaciones')
        .doc(post)
        .collection('comentarios')
        .doc();
      commentDB = {
        usuario,
        texto,
      };

      await commentRef.set(commentDB);
      commentDB = await commentRef.get();

      return commentDB.data();
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readPost: async function (id) {
    let postDB = null;
    try {
      const postRef = db.collection('publicaciones').doc(id);

      postDB = await postRef.get();

      const comments = await this.readComments(id);

      return { ...postDB.data(), comentarios: comments };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readComments: async function (post) {
    try {
      const comments = await db
        .collection('publicaciones')
        .doc(post)
        .collection('comentarios')
        .get();

      return comments.docs.map((doc) => doc.data());
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  readPostsByUser: async function (uid) {
    try {
      const postsRef = db.collection('publicaciones');
      const snapshot = await postsRef.where('usuario', '==', uid).get();

      if (snapshot.empty) {
        throw 'No matching documents.';
      }

      let posts = [];

      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });

      return posts;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  updatePost: async function ({ usuario, imagen, video, descripcion }, id) {
    let postDB = null;
    try {
      const postRef = db.collection('publicaciones').doc(id);

      const fieldsToEdit = Object.fromEntries(
        Object.entries({
          imagen,
          video,
          descripcion,
        }).filter(([key, value]) => !!value)
      );

      await postRef.update(fieldsToEdit);

      postDB = await postRef.get();

      return postDB.data();
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  deletePost: async function (id) {
    try {
      const postRef = db.collection('publicaciones').doc(id);

      let isCommentsDeleted = false;

      await db
        .collection('publicaciones')
        .doc(id)
        .collection('comentarios')
        .get()
        .then(async (querySnapshot) => {
          await querySnapshot.forEach(async (doc) => {
            await doc.ref.delete();
          });
          isCommentsDeleted = true;
        });

      let isDBpostDeleted = false;

      if (isCommentsDeleted) {
        isDBpostDeleted = await !!postRef.delete();
      }

      return isCommentsDeleted && isDBpostDeleted;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
};

module.exports = service;
