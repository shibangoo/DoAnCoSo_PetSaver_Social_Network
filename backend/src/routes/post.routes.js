const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js')

router.post('/create', verifyToken, postController.createPost);
router.get('/', postController.getAllPosts);
router.post('/:postId/react', verifyToken, postController.toggleReaction);
router.get('/:postId/comments', postController.getPostComments); //xem binh luan
router.post('/:postId/comments', verifyToken, postController.addComment); //viet binh luan
module.exports = router;