const express = require('express')
const router = express.Router();
const maquinarioController = require('../controller/maquinarioController');
const { verifyLocalToken, isAdmin, isAdminOrManager, isAdminOrManagerOrOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, maquinarioController.findAll);
router.get('/export/template', verifyLocalToken, isAdminOrManagerOrOrcamentista, maquinarioController.exportTemplate);
router.get('/export/list', verifyLocalToken, isAdminOrManagerOrOrcamentista, maquinarioController.exportList);
router.get('/maquinario/:id', verifyLocalToken, maquinarioController.findById);
router.get('/maquinario/:id/fornecedores', verifyLocalToken, maquinarioController.getFornecedores);

router.post('/maquinario', verifyLocalToken, isAdminOrManagerOrOrcamentista, maquinarioController.create);
router.post('/import', verifyLocalToken, isAdminOrManagerOrOrcamentista, maquinarioController.importExcel);
router.post('/maquinario/:id/fornecedores', verifyLocalToken, isAdminOrManagerOrOrcamentista, maquinarioController.addFornecedor);

router.put('/maquinario/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, maquinarioController.update);

router.delete('/maquinario/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, maquinarioController.delete);
router.delete('/maquinario/:id/fornecedores/:fornecedorId', verifyLocalToken, isAdminOrManagerOrOrcamentista, maquinarioController.removeFornecedor);

module.exports = router;
