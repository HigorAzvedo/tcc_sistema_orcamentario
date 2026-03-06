const express = require('express');
const router = express.Router();
const orcamentistaController = require('../controller/orcamentistaController');
const { verifyLocalToken, isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, orcamentistaController.findAll);
router.get('/orcamentista/:id', verifyLocalToken, orcamentistaController.findById);

router.post('/orcamentista', verifyLocalToken, isAdminOrManager, orcamentistaController.create);
router.put('/orcamentista/:id', verifyLocalToken, isAdminOrManager, orcamentistaController.update);

router.delete('/orcamentista/:id', verifyLocalToken, isAdmin, orcamentistaController.delete); 

module.exports = router;