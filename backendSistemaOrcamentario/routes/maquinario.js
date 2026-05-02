const express = require('express')
const router = express.Router();
const maquinarioController = require('../controller/maquinarioController');
const { verifyLocalToken, isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, maquinarioController.findAll);
router.get('/maquinario/:id', verifyLocalToken, maquinarioController.findById);
router.get('/maquinario/:id/fornecedores', verifyLocalToken, maquinarioController.getFornecedores);

router.post('/maquinario', verifyLocalToken, isAdminOrManager, maquinarioController.create);
router.post('/maquinario/:id/fornecedores', verifyLocalToken, isAdminOrManager, maquinarioController.addFornecedor);

router.put('/maquinario/:id', verifyLocalToken, isAdminOrManager, maquinarioController.update);

router.delete('/maquinario/:id', verifyLocalToken, isAdmin, maquinarioController.delete);
router.delete('/maquinario/:id/fornecedores/:fornecedorId', verifyLocalToken, isAdmin, maquinarioController.removeFornecedor);

module.exports = router;