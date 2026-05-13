const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js');
const { aiLimiter } = require('../middlewares/rateLimiter.js');

// Apply AI specific rate limiter
router.post('/analyze-pets', verifyToken, aiLimiter, aiController.analyzePetCount);
router.post('/chat', verifyToken, aiLimiter, aiController.chatWithBot);

module.exports = router;
