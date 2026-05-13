const express = require('express');
const router = express.Router();
const petController = require('../controllers/pet.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js');

router.post('/', verifyToken, petController.createPet);
router.get('/:id', petController.getPetById);
router.put('/:id', verifyToken, petController.updatePet);
router.delete('/:id', verifyToken, petController.softDeletePet);
router.post('/:id/restore', verifyToken, petController.restorePet);
router.post('/:id/transfer', verifyToken, petController.transferOwnership);

module.exports = router;
