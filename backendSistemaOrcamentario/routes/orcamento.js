const express = require('express');
const router = express.Router();
const orcamentoController = require('../controller/orcamentoController');
const { verifyLocalToken, isAdmin, isAdminOrManager, isAdminOrManagerOrOrcamentista, attachClienteId } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, attachClienteId, orcamentoController.findAll);
router.get('/orcamentos/projetos', verifyLocalToken, attachClienteId, orcamentoController.getAllProjetos);
router.get('/orcamentos/:id/projetos', verifyLocalToken, attachClienteId, orcamentoController.getProjetosByOrcamentoId);
router.get('/orcamento/:id', verifyLocalToken, attachClienteId, orcamentoController.findById);
router.get('/orcamento/:id/export/pdf', verifyLocalToken, attachClienteId, orcamentoController.exportPdf);
router.get('/orcamento/:id/export/excel', verifyLocalToken, attachClienteId, orcamentoController.exportExcel);

router.post('/orcamento', verifyLocalToken, isAdminOrManager, orcamentoController.create);
router.put('/orcamento/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, attachClienteId, orcamentoController.update);
router.put('/orcamento/:id/test', verifyLocalToken, isAdminOrManager, orcamentoController.testUpdateValorTotal);

router.delete('/orcamento/:id', verifyLocalToken, isAdmin, orcamentoController.delete);  

module.exports = router;


