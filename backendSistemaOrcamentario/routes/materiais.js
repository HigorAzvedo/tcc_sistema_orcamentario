const express = require('express');
const router = express.Router();
const materiaisController = require('../controller/materiaisController');
const { verifyLocalToken, isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, materiaisController.findAll);
router.get('/export/template', verifyLocalToken, isAdminOrManager, materiaisController.exportTemplate);
router.get('/export/list', verifyLocalToken, isAdminOrManager, materiaisController.exportList);
router.get('/material/:id', verifyLocalToken, materiaisController.findById);
router.get('/material/:id/fornecedores', verifyLocalToken, materiaisController.getFornecedores);

router.post('/material', verifyLocalToken, isAdminOrManager, materiaisController.create);
router.post('/import', verifyLocalToken, isAdminOrManager, materiaisController.importExcel);
router.post('/material/:id/fornecedores', verifyLocalToken, isAdminOrManager, materiaisController.addFornecedor);

router.put('/material/:id', verifyLocalToken, isAdminOrManager, materiaisController.update);

router.delete('/material/:id', verifyLocalToken, isAdmin, materiaisController.delete);
router.delete('/material/:id/fornecedores/:fornecedorId', verifyLocalToken, isAdmin, materiaisController.removeFornecedor);

module.exports = router;

