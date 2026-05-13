const express = require('express');
const router = express.Router();
const coOwnershipController = require('../controllers/co-ownership.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js');

router.post('/invite', verifyToken, coOwnershipController.inviteCoOwner);
router.post('/invites/:id/respond', verifyToken, coOwnershipController.respondToInvitation);

router.post('/pets/:petId/request-deletion', verifyToken, coOwnershipController.requestDeletion);
router.post('/deletion-requests/:id/respond', verifyToken, coOwnershipController.respondToDeletion);
router.post('/deletion-requests/:id/escalate', verifyToken, coOwnershipController.escalateDeletion);

module.exports = router;
