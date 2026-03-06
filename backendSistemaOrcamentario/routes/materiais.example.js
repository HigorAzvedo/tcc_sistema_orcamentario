const express = require('express');
const router = express.Router();
const materiaisController = require('../controller/materiaisController');
const { verifyLocalToken, isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, materiaisController.findAll);
router.get('/material/:id', verifyLocalToken, materiaisController.findById);

router.post('/material', verifyLocalToken, isAdminOrManager, materiaisController.create);
router.put('/material/:id', verifyLocalToken, isAdminOrManager, materiaisController.update);

router.delete('/material/:id', verifyLocalToken, isAdmin, materiaisController.delete);

module.exports = router;
