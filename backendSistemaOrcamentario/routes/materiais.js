const express = require('express');
const router = express.Router();
const materiaisController = require('../controller/materiaisController');
const { verifyLocalToken, isAdmin, isAdminOrManager, isAdminOrManagerOrOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, materiaisController.findAll);
router.get('/export/template', verifyLocalToken, isAdminOrManagerOrOrcamentista, materiaisController.exportTemplate);
router.get('/export/list', verifyLocalToken, isAdminOrManagerOrOrcamentista, materiaisController.exportList);
router.get('/material/:id', verifyLocalToken, materiaisController.findById);
router.get('/material/:id/fornecedores', verifyLocalToken, materiaisController.getFornecedores);

router.post('/material', verifyLocalToken, isAdminOrManagerOrOrcamentista, materiaisController.create);
router.post('/import', verifyLocalToken, isAdminOrManagerOrOrcamentista, materiaisController.importExcel);
router.post('/material/:id/fornecedores', verifyLocalToken, isAdminOrManagerOrOrcamentista, materiaisController.addFornecedor);

router.put('/material/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, materiaisController.update);

router.delete('/material/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, materiaisController.delete);
router.delete('/material/:id/fornecedores/:fornecedorId', verifyLocalToken, isAdminOrManagerOrOrcamentista, materiaisController.removeFornecedor);

module.exports = router;

