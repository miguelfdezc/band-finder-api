'use strict';

const { db } = require('./firebase.service');
let UserService = require('./user.service');

const service = {
  createPost: async function ({ usuario, imagen, video, descripcion }) {
    try {
      const post = await db.collection('publicaciones').add({
        usuario,
        imagen: imagen ?? '',
        video: video ?? '',
        descripcion,
        likes: [],
        shared: 0,
      });
      const postData = await post.get();

      return { id: post.id, ...postData.data() };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  addComment: async function ({ usuario: uid, texto }, post) {
    let commentDB = null;
    try {
      const commentRef = db
        .collection('publicaciones')
        .doc(post)
        .collection('comentarios')
        .doc();

      const user = await UserService.readUser(uid);

      commentDB = {
        usuario: uid,
        username: user.usuario,
        userImg: user.photoURL,
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
        return [];
      }

      let posts = [];

      const usuario = await UserService.readUser(uid);

      snapshot.forEach(async (doc) => {
        posts.push({
          id: doc.id,
          username: usuario.usuario,
          userImg: usuario.photoURL,
          ...doc.data(),
        });
      });

      for (let i = 0; i < posts.length; i++) {
        const comments = await this.readComments(posts[i].id);
        posts[i].comentarios = comments;
      }

      return posts;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  updateLikes: async function ({ usuario }, id) {
    let post = null,
      postDB = null;
    try {
      const postRef = db.collection('publicaciones').doc(id);

      post = await postRef.get();
      let likes = post.data().likes;

      const found = likes.some((value) => value === usuario);
      if (found) likes = likes.filter(() => !likes.includes(usuario));
      else if (!found) likes.push(usuario);

      await postRef.update({ likes });

      postDB = await postRef.get();

      return { id: postDB.id, ...postDB.data() };
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  updateShared: async function (id) {
    let post = null,
      postDB = null;
    try {
      const postRef = db.collection('publicaciones').doc(id);

      post = await postRef.get();
      let shared = post.data().shared + 1;

      await postRef.update({ shared });

      postDB = await postRef.get();

      return { id: postDB.id, ...postDB.data() };
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
