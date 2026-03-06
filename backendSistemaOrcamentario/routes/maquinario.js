const express = require('express')
const router = express.Router();
const maquinarioController = require('../controller/maquinarioController');
const { verifyLocalToken, isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, maquinarioController.findAll);
router.get('/maquinario/:id', verifyLocalToken, maquinarioController.findById);

router.post('/maquinario', verifyLocalToken, isAdminOrManager, maquinarioController.create);
router.put('/maquinario/:id', verifyLocalToken, isAdminOrManager, maquinarioController.update);

router.delete('/maquinario/:id', verifyLocalToken, isAdmin, maquinarioController.delete);

module.exports = router;