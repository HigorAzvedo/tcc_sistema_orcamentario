const express = require('express');
const router = express.Router();
const itensOrcamentoController = require('../controller/itensOrcamentoController');
const { verifyLocalToken, isAdmin, isAdminOrManagerOrOrcamentista, attachClienteId } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', verifyLocalToken, itensOrcamentoController.findAll);
router.get('/itensOrcamento/options', verifyLocalToken, itensOrcamentoController.getAllOptions);
router.get('/itensOrcamento/:id', verifyLocalToken, itensOrcamentoController.findById);
router.get('/orcamento/:orcamentoId', verifyLocalToken, itensOrcamentoController.findAllByOrcamentoId);

router.post('/itensOrcamento', verifyLocalToken, isAdminOrManagerOrOrcamentista, attachClienteId, itensOrcamentoController.create);
router.put('/itensOrcamento/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, attachClienteId, itensOrcamentoController.update);

router.delete('/itensOrcamento/:id', verifyLocalToken, isAdmin, itensOrcamentoController.delete);

// Importar itens via arquivo Excel (multipart/form-data, campo 'file')
router.post('/import', verifyLocalToken, isAdminOrManagerOrOrcamentista, attachClienteId, upload.single('file'), itensOrcamentoController.importFile);


module.exports = router;
