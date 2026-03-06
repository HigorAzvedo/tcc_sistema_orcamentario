const express = require('express');
const router = express.Router();
const itensOrcamentoController = require('../controller/itensOrcamentoController');
const { verifyLocalToken, isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, itensOrcamentoController.findAll);
router.get('/itensOrcamento/options', verifyLocalToken, itensOrcamentoController.getAllOptions);
router.get('/itensOrcamento/:id', verifyLocalToken, itensOrcamentoController.findById);
router.get('/orcamento/:orcamentoId', verifyLocalToken, itensOrcamentoController.findAllByOrcamentoId);

router.post('/itensOrcamento', verifyLocalToken, isAdminOrManager, itensOrcamentoController.create);
router.put('/itensOrcamento/:id', verifyLocalToken, isAdminOrManager, itensOrcamentoController.update);

router.delete('/itensOrcamento/:id', verifyLocalToken, isAdmin, itensOrcamentoController.delete);


module.exports = router;
