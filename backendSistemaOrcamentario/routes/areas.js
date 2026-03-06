const express = require('express');
const router = express.Router();
const areasController = require('../controller/areasController');
const { verifyLocalToken, isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, areasController.findAll);
router.get('/area/:id', verifyLocalToken, areasController.findById);

router.post('/area', verifyLocalToken, isAdminOrManager, areasController.create);
router.put('/area/:id', verifyLocalToken, isAdminOrManager, areasController.update);

router.delete('/area/:id', verifyLocalToken, isAdmin, areasController.delete);

module.exports = router;