'use strict';

const express = require('express');
const router = express.Router();

const PostController = require('../controllers/post.controller');

router.post('/posts', PostController.createPost);
router.post('/posts/:id/comments', PostController.addComment);
router.get('/posts/:id', PostController.readPost);
router.get('/posts', PostController.readPosts);
router.get('/length/posts', PostController.getPostsLength);
router.get('/posts/user/:uid', PostController.readPostsByUser);
router.get('/posts/user/:uid/followed', PostController.readPostsByFollowed);
router.put('/posts/likes/:id', PostController.updateLikes);
router.put('/posts/shares/:id', PostController.updateShared);
router.put('/posts/:id', PostController.updatePost);
router.delete('/posts/:id', PostController.deletePost);

module.exports = router;
