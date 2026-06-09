const express = require('express');
const router = express.Router();
const cargoController = require('../controller/cargoController');
const { verifyLocalToken, isAdmin, isAdminOrManager } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, cargoController.findAll);
router.get('/export/template', verifyLocalToken, isAdminOrManager, cargoController.exportTemplate);
router.get('/export/list', verifyLocalToken, isAdminOrManager, cargoController.exportList);
router.get('/cargo/:id', verifyLocalToken, cargoController.findById);

router.post('/cargo', verifyLocalToken, isAdminOrManager, cargoController.create);
router.post('/import', verifyLocalToken, isAdminOrManager, cargoController.importExcel);
router.put('/cargo/:id', verifyLocalToken, isAdminOrManager, cargoController.update);

router.delete('/cargo/:id', verifyLocalToken, isAdmin, cargoController.delete)

module.exports = router;
