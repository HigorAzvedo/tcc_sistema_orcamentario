const express = require('express');
const router = express.Router();
const fornecedorController = require('../controller/fornecedorController');
const { verifyLocalToken, isAdmin, isAdminOrManagerOrOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, fornecedorController.findAll);
router.get('/fornecedor/:id', verifyLocalToken, fornecedorController.findById);

router.post('/fornecedor', verifyLocalToken, isAdminOrManagerOrOrcamentista, fornecedorController.create);
router.put('/fornecedor/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, fornecedorController.update);

router.post('/fornecedor/:id/materiais', verifyLocalToken, isAdminOrManagerOrOrcamentista, fornecedorController.addMaterial);
router.post('/fornecedor/:id/maquinarios', verifyLocalToken, isAdminOrManagerOrOrcamentista, fornecedorController.addMaquinario);

router.delete('/fornecedor/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, fornecedorController.delete);
router.delete('/fornecedor/:id/materiais/:materialId', verifyLocalToken, isAdminOrManagerOrOrcamentista, fornecedorController.removeMaterial);
router.delete('/fornecedor/:id/maquinarios/:maquinarioId', verifyLocalToken, isAdminOrManagerOrOrcamentista, fornecedorController.removeMaquinario);

module.exports = router;
