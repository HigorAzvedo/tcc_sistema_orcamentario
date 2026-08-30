const express = require('express')
const router = express.Router();
const maquinarioController = require('../controller/maquinarioController');
const { verifyLocalToken, isAdmin, isAdminOrOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, maquinarioController.findAll);
router.get('/export/template', verifyLocalToken, isAdminOrOrcamentista, maquinarioController.exportTemplate);
router.get('/export/list', verifyLocalToken, isAdminOrOrcamentista, maquinarioController.exportList);
router.get('/maquinario/:id', verifyLocalToken, maquinarioController.findById);
router.get('/maquinario/:id/fornecedores', verifyLocalToken, maquinarioController.getFornecedores);

router.post('/maquinario', verifyLocalToken, isAdminOrOrcamentista, maquinarioController.create);
router.post('/import', verifyLocalToken, isAdminOrOrcamentista, maquinarioController.importExcel);
router.post('/maquinario/:id/fornecedores', verifyLocalToken, isAdminOrOrcamentista, maquinarioController.addFornecedor);

router.put('/maquinario/:id', verifyLocalToken, isAdminOrOrcamentista, maquinarioController.update);

router.delete('/maquinario/:id', verifyLocalToken, isAdminOrOrcamentista, maquinarioController.delete);
router.delete('/maquinario/:id/fornecedores/:fornecedorId', verifyLocalToken, isAdminOrOrcamentista, maquinarioController.removeFornecedor);

module.exports = router;
