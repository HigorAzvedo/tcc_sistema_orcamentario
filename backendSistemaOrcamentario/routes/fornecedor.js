const express = require('express');
const router = express.Router();
const fornecedorController = require('../controller/fornecedorController');
const { verifyLocalToken, isAdmin, isAdminOrOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, fornecedorController.findAll);
router.get('/fornecedor/:id', verifyLocalToken, fornecedorController.findById);

router.post('/fornecedor', verifyLocalToken, isAdminOrOrcamentista, fornecedorController.create);
router.put('/fornecedor/:id', verifyLocalToken, isAdminOrOrcamentista, fornecedorController.update);

router.post('/fornecedor/:id/materiais', verifyLocalToken, isAdminOrOrcamentista, fornecedorController.addMaterial);
router.post('/fornecedor/:id/maquinarios', verifyLocalToken, isAdminOrOrcamentista, fornecedorController.addMaquinario);

router.delete('/fornecedor/:id', verifyLocalToken, isAdminOrOrcamentista, fornecedorController.delete);
router.delete('/fornecedor/:id/materiais/:materialId', verifyLocalToken, isAdminOrOrcamentista, fornecedorController.removeMaterial);
router.delete('/fornecedor/:id/maquinarios/:maquinarioId', verifyLocalToken, isAdminOrOrcamentista, fornecedorController.removeMaquinario);

module.exports = router;
