const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js');

router.get('/explore', verifyToken, searchController.getExploreContent);
router.get('/', verifyToken, searchController.searchAll);

module.exports = router;
