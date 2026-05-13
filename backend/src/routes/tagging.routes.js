const express = require('express');
const router = express.Router();
const taggingController = require('../controllers/tagging.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js');
const { tagLimiter } = require('../middlewares/rateLimiter.js');

// Apply tag limiter to respond (though tag limiting is more for creating tags, but we add here just in case)
router.post('/posts/:postId/pets/:petId/respond', verifyToken, taggingController.respondToPostTag);

router.post('/block', verifyToken, taggingController.blockUserTagging);
router.post('/unblock', verifyToken, taggingController.unblockUserTagging);

module.exports = router;
