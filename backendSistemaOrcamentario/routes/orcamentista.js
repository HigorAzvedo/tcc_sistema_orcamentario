const express = require('express');
const router = express.Router();
const orcamentistaController = require('../controller/orcamentistaController');
const { verifyLocalToken, isAdmin, isAdminOrManager, isOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, orcamentistaController.findAll);
router.get('/orcamentista/:id', verifyLocalToken, orcamentistaController.findById);

// Rota protegida para admin criar orçamentista
router.post('/orcamentista', verifyLocalToken, isAdminOrManager, orcamentistaController.create);
router.put('/orcamentista/:id', verifyLocalToken, isAdminOrManager, orcamentistaController.update);

router.delete('/orcamentista/:id', verifyLocalToken, isAdmin, orcamentistaController.delete); 

// Rotas para gerenciar vínculos com clientes (Admin/Manager)
router.post('/vincular-cliente', verifyLocalToken, isAdminOrManager, orcamentistaController.vincularCliente);
router.delete('/desvincular-cliente/:orcamentistaId/:clienteId', verifyLocalToken, isAdminOrManager, orcamentistaController.desvincularCliente);
router.get('/clientes-vinculados/:id', verifyLocalToken, orcamentistaController.getClientesVinculados);

// Rotas para o orçamentista acessar seus próprios dados
router.get('/meus-dados', verifyLocalToken, isOrcamentista, orcamentistaController.getMeusDados);
router.get('/meus-projetos', verifyLocalToken, isOrcamentista, orcamentistaController.getMeusProjetos);
router.get('/meus-orcamentos', verifyLocalToken, isOrcamentista, orcamentistaController.getMeusOrcamentos);

// Rotas para orçamentista se auto-vincular/desvincular de clientes
router.post('/auto-vincular-cliente', verifyLocalToken, isOrcamentista, orcamentistaController.autoVincularCliente);
router.delete('/auto-desvincular-cliente/:clienteId', verifyLocalToken, isOrcamentista, orcamentistaController.autoDesvincularCliente);

module.exports = router;