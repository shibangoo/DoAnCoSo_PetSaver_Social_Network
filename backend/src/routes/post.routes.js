const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller.js');

//Import ham bao ve
const verifyToken = require('../middlewares/auth.middleware.js')
router.post('/create', verifyToken, postController.createPost);

module.exports = router;