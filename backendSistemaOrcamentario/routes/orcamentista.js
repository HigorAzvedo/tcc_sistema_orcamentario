const express = require('express');
const router = express.Router();
const orcamentistaController = require('../controller/orcamentistaController');
const { verifyLocalToken, isAdmin, isOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, orcamentistaController.findAll);
router.get('/orcamentista/:id', verifyLocalToken, orcamentistaController.findById);

// Rotas protegidas para administrador gerenciar orçamentistas.
router.post('/orcamentista', verifyLocalToken, isAdmin, orcamentistaController.create);
router.put('/orcamentista/:id', verifyLocalToken, isAdmin, orcamentistaController.update);

router.delete('/orcamentista/:id', verifyLocalToken, isAdmin, orcamentistaController.delete); 

// Rotas para o administrador gerenciar vínculos com clientes.
router.post('/vincular-cliente', verifyLocalToken, isAdmin, orcamentistaController.vincularCliente);
router.delete('/desvincular-cliente/:orcamentistaId/:clienteId', verifyLocalToken, isAdmin, orcamentistaController.desvincularCliente);
router.get('/clientes-vinculados/:id', verifyLocalToken, orcamentistaController.getClientesVinculados);

// Rotas para o orçamentista acessar seus próprios dados
router.get('/meus-dados', verifyLocalToken, isOrcamentista, orcamentistaController.getMeusDados);
router.get('/meus-clientes', verifyLocalToken, isOrcamentista, orcamentistaController.getMeusClientes);
router.get('/meus-projetos', verifyLocalToken, isOrcamentista, orcamentistaController.getMeusProjetos);
router.get('/meus-orcamentos', verifyLocalToken, isOrcamentista, orcamentistaController.getMeusOrcamentos);

// Rotas para orçamentista se auto-vincular/desvincular de clientes
router.post('/auto-vincular-cliente', verifyLocalToken, isOrcamentista, orcamentistaController.autoVincularCliente);
router.delete('/auto-desvincular-cliente/:clienteId', verifyLocalToken, isOrcamentista, orcamentistaController.autoDesvincularCliente);

module.exports = router;
