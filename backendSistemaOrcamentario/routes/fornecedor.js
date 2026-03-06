const express = require('express');
const router = express.Router();
const fornecedorController = require('../controller/fornecedorController');
const { verifyLocalToken, isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, fornecedorController.findAll);
router.get('/fornecedor/:id', verifyLocalToken, fornecedorController.findById);

router.post('/fornecedor', verifyLocalToken, isAdminOrManager, fornecedorController.create);
router.put('/fornecedor/:id', verifyLocalToken, isAdminOrManager, fornecedorController.update);

router.post('/fornecedor/:id/materiais', verifyLocalToken, isAdminOrManager, fornecedorController.addMaterial);
router.post('/fornecedor/:id/maquinarios', verifyLocalToken, isAdminOrManager, fornecedorController.addMaquinario);

router.delete('/fornecedor/:id', verifyLocalToken, isAdmin, fornecedorController.delete);
router.delete('/fornecedor/:id/materiais/:materialId', verifyLocalToken, isAdmin, fornecedorController.removeMaterial);
router.delete('/fornecedor/:id/maquinarios/:maquinarioId', verifyLocalToken, isAdmin, fornecedorController.removeMaquinario);

module.exports = router;
