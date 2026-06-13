const express = require('express');
const router = express.Router();
const cargoController = require('../controller/cargoController');
const { verifyLocalToken, isAdmin, isAdminOrManager, isAdminOrManagerOrOrcamentista } = require('../middleware/authMiddleware');

router.get('/', verifyLocalToken, cargoController.findAll);
router.get('/export/template', verifyLocalToken, isAdminOrManagerOrOrcamentista, cargoController.exportTemplate);
router.get('/export/list', verifyLocalToken, isAdminOrManagerOrOrcamentista, cargoController.exportList);
router.get('/cargo/:id', verifyLocalToken, cargoController.findById);

router.post('/cargo', verifyLocalToken, isAdminOrManagerOrOrcamentista, cargoController.create);
router.post('/import', verifyLocalToken, isAdminOrManagerOrOrcamentista, cargoController.importExcel);
router.put('/cargo/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, cargoController.update);

router.delete('/cargo/:id', verifyLocalToken, isAdminOrManagerOrOrcamentista, cargoController.delete)

module.exports = router;
