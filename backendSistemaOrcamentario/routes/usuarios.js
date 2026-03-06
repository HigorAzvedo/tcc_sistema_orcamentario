const express = require('express');
const router = express.Router();
const usuariosController = require('../controller/usuariosController');
const { verifyLocalToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, isAdmin, usuariosController.index);
router.get('/:id', verifyLocalToken, isAdmin, usuariosController.show);
router.put('/:id', verifyLocalToken, isAdmin, usuariosController.update);
router.delete('/:id', verifyLocalToken, isAdmin, usuariosController.delete);

module.exports = router;
