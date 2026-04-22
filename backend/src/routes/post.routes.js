const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js')

router.post('/create', verifyToken, postController.createPost);
router.get('/', postController.getAllPosts);
module.exports = router;