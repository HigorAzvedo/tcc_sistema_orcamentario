const express = require('express')
const router = express.Router();
const clienteController = require('../controller/clienteController');
const { verifyLocalToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, clienteController.findAll);
router.get('/cliente/:id', verifyLocalToken, clienteController.findById);

router.post('/cliente', verifyLocalToken, isAdmin, clienteController.create);
router.post('/cliente/:id/vincular-usuario', verifyLocalToken, isAdmin, clienteController.linkUsuario);

router.put('/cliente/:id', verifyLocalToken, isAdmin, clienteController.update);

router.delete('/cliente/:id', verifyLocalToken, isAdmin, clienteController.delete);
router.delete('/cliente/:id/desvincular-usuario', verifyLocalToken, isAdmin, clienteController.unlinkUsuario);

module.exports = router;

