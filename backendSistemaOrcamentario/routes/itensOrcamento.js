const express = require('express');
const router = express.Router();
const itensOrcamentoController = require('../controller/itensOrcamentoController');
const { verifyLocalToken, isAdmin, isAdminOrOrcamentista, attachClienteId } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, itensOrcamentoController.findAll);
router.get('/itensOrcamento/options', verifyLocalToken, itensOrcamentoController.getAllOptions);
router.get('/export/template', verifyLocalToken, isAdminOrOrcamentista, itensOrcamentoController.exportTemplate);
router.get('/itensOrcamento/:id', verifyLocalToken, itensOrcamentoController.findById);
router.get('/orcamento/:orcamentoId', verifyLocalToken, itensOrcamentoController.findAllByOrcamentoId);

router.post('/itensOrcamento', verifyLocalToken, isAdminOrOrcamentista, attachClienteId, itensOrcamentoController.create);
router.post('/import/preview', verifyLocalToken, isAdminOrOrcamentista, attachClienteId, itensOrcamentoController.importPreview);
router.put('/itensOrcamento/:id', verifyLocalToken, isAdminOrOrcamentista, attachClienteId, itensOrcamentoController.update);

router.delete('/itensOrcamento/:id', verifyLocalToken, isAdmin, itensOrcamentoController.delete);


module.exports = router;
