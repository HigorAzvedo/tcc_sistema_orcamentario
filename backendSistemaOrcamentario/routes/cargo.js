const express = require('express');
const router = express.Router();
const cargoController = require('../controller/cargoController');
const { verifyLocalToken, isAdmin, isAdminOrOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, cargoController.findAll);
router.get('/export/template', verifyLocalToken, isAdminOrOrcamentista, cargoController.exportTemplate);
router.get('/export/list', verifyLocalToken, isAdminOrOrcamentista, cargoController.exportList);
router.get('/cargo/:id', verifyLocalToken, cargoController.findById);

router.post('/cargo', verifyLocalToken, isAdminOrOrcamentista, cargoController.create);
router.post('/import', verifyLocalToken, isAdminOrOrcamentista, cargoController.importExcel);
router.put('/cargo/:id', verifyLocalToken, isAdminOrOrcamentista, cargoController.update);

router.delete('/cargo/:id', verifyLocalToken, isAdminOrOrcamentista, cargoController.delete)

module.exports = router;
