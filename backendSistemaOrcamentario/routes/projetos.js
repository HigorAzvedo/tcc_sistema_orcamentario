const express = require('express');
const router = express.Router();
const projetoController = require('../controller/projetoController');
const { verifyLocalToken, isAdmin, isAdminOrManager, isAdminOrManagerOrOrcamentista, attachClienteId } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, attachClienteId, projetoController.findAll);
router.get('/projeto/:id', verifyLocalToken, attachClienteId, projetoController.findById);

router.post('/projeto', verifyLocalToken, isAdminOrManager, projetoController.create);
router.put('/projeto/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, attachClienteId, projetoController.update);

router.delete('/projeto/:id', verifyLocalToken, isAdmin, projetoController.delete);

module.exports = router;



