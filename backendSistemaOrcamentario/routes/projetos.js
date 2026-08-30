const express = require('express');
const router = express.Router();
const projetoController = require('../controller/projetoController');
const { verifyLocalToken, isAdmin, isAdminOrOrcamentista, attachClienteId } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, attachClienteId, projetoController.findAll);
router.get('/projeto/:id', verifyLocalToken, attachClienteId, projetoController.findById);

router.post('/projeto', verifyLocalToken, isAdminOrOrcamentista, attachClienteId, projetoController.create);
router.put('/projeto/:id', verifyLocalToken, isAdminOrOrcamentista, attachClienteId, projetoController.update);

router.delete('/projeto/:id', verifyLocalToken, isAdminOrOrcamentista, attachClienteId, projetoController.delete);

module.exports = router;



