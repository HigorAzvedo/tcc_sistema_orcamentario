const express = require('express');
const router = express.Router();
const materiaisController = require('../controller/materiaisController');
const { verifyLocalToken, isAdmin, isAdminOrOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, materiaisController.findAll);
router.get('/export/template', verifyLocalToken, isAdminOrOrcamentista, materiaisController.exportTemplate);
router.get('/export/list', verifyLocalToken, isAdminOrOrcamentista, materiaisController.exportList);
router.get('/material/:id', verifyLocalToken, materiaisController.findById);
router.get('/material/:id/fornecedores', verifyLocalToken, materiaisController.getFornecedores);

router.post('/material', verifyLocalToken, isAdminOrOrcamentista, materiaisController.create);
router.post('/import', verifyLocalToken, isAdminOrOrcamentista, materiaisController.importExcel);
router.post('/material/:id/fornecedores', verifyLocalToken, isAdminOrOrcamentista, materiaisController.addFornecedor);

router.put('/material/:id', verifyLocalToken, isAdminOrOrcamentista, materiaisController.update);

router.delete('/material/:id', verifyLocalToken, isAdminOrOrcamentista, materiaisController.delete);
router.delete('/material/:id/fornecedores/:fornecedorId', verifyLocalToken, isAdminOrOrcamentista, materiaisController.removeFornecedor);

module.exports = router;

