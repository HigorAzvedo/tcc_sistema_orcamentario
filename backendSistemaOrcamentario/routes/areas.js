const express = require('express');
const router = express.Router();
const areasController = require('../controller/areasController');
const { verifyLocalToken, isAdmin, isAdminOrManagerOrOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, areasController.findAll);
router.get('/area/:id', verifyLocalToken, areasController.findById);

router.post('/area', verifyLocalToken, isAdminOrManagerOrOrcamentista, areasController.create);
router.put('/area/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, areasController.update);

router.delete('/area/:id', verifyLocalToken, isAdmin, areasController.delete);

module.exports = router;