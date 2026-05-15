const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js')


router.post('/create', verifyToken, postController.createPost); //tao bai viet
router.put('/:postId', verifyToken, postController.updatePost); //chỉnh sửa bài viết
router.delete('/:postId', verifyToken, postController.deletePost); //xóa bài viết

router.get('/', postController.getAllPosts); //lay feed

router.post('/:postId/react', verifyToken, postController.toggleReaction); //reaction

router.get('/:postId/comments', postController.getPostComments); //xem binh luan
router.post('/:postId/comments', verifyToken, postController.addComment); //viet binh luan

router.put('/:postId/comments/:commentId', verifyToken, postController.updateComment);
router.delete('/:postId/comments/:commentId', verifyToken, postController.deleteComment);
router.post('/:postId/comments/:commentId/react', verifyToken, postController.reactComment);


module.exports = router;