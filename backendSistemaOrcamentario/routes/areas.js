const express = require('express');
const router = express.Router();
const areasController = require('../controller/areasController');
const { verifyLocalToken, isAdmin, isAdminOrOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, areasController.findAll);
router.get('/area/:id', verifyLocalToken, areasController.findById);

router.post('/area', verifyLocalToken, isAdminOrOrcamentista, areasController.create);
router.put('/area/:id', verifyLocalToken, isAdminOrOrcamentista, areasController.update);

router.delete('/area/:id', verifyLocalToken, isAdmin, areasController.delete);

module.exports = router;
