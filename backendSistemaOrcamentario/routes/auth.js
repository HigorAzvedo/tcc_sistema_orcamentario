const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { verifyLocalToken } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login/auth0', authController.loginAuth0);
router.post('/refresh-token', authController.refreshToken);

router.get('/me', verifyLocalToken, authController.me);

module.exports = router;
