const jwt = require('jsonwebtoken');
const { auth } = require('express-oauth2-jwt-bearer');
const clienteModel = require('../model/clienteModel');

// Usuarios cadastrados no sistema
// "nome": "Usuário Teste",
//   "email": "user@test.com",
//   "senha": "senha123",
//   "role": "user"

// email: admin@sistema.com
// senha: admin123

const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
    tokenSigningAlg: 'RS256'
});

const verifyLocalToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        return res.status(401).json({ error: 'Token inválido' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Acesso negado. Permissão insuficiente.' 
            });
        }
        next();
    };
};

const isAdmin = checkRole(['admin']);

const isAdminOrManager = checkRole(['admin', 'manager']);

const isOrcamentista = checkRole(['orcamentista']);

const isAdminOrManagerOrOrcamentista = checkRole(['admin', 'manager', 'orcamentista']);

const attachClienteId = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Se for admin ou manager, não precisa filtrar por cliente
        if (req.user.role === 'admin' || req.user.role === 'manager') {
            req.clienteId = null; // null = ver todos
            return next();
        }

        // Se for user, busca o cliente vinculado
        if (req.user.role === 'user') {
            const cliente = await clienteModel.findByUsuarioId(req.user.id);
            
            if (cliente === -1) {
                return res.status(403).json({ 
                    error: 'Usuário não está vinculado a nenhum cliente.' 
                });
            }

            req.clienteId = cliente.id;
            return next();
        }

        return res.status(403).json({ error: 'Role de usuário inválida.' });
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        return res.status(500).json({ error: 'Erro ao processar autenticação.' });
    }
};

module.exports = {
    jwtCheck,
    verifyLocalToken,
    checkRole,
    isAdmin,
    isAdminOrManager,
    isOrcamentista,
    isAdminOrManagerOrOrcamentista,
    attachClienteId
};
