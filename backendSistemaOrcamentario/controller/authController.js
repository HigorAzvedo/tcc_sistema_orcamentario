const usuariosModel = require('../model/usuariosModel');
const jwt = require('jsonwebtoken');
const axios = require('axios');

module.exports = {
    async register(req, res) {
        try {
            const { nome, email, senha, role, clienteId } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ 
                    error: 'Nome, email e senha são obrigatórios' 
                });
            }

            const result = await usuariosModel.create({ 
                nome, 
                email, 
                senha, 
                role: role || 'user' 
            });

            if (result === "EMAIL_EXISTS") {
                return res.status(409).json({ 
                    error: 'Email já cadastrado' 
                });
            }

            try {
                if (process.env.AUTH0_DOMAIN && process.env.AUTH0_CLIENT_ID) {
                    await axios.post(`https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`, {
                        client_id: process.env.AUTH0_CLIENT_ID,
                        email,
                        password: senha,
                        connection: 'Username-Password-Authentication',
                        user_metadata: { nome, role }
                    });
                }
            } catch (auth0Error) {
                console.log('Erro ao registrar no Auth0:', auth0Error.message);
            }

            res.status(201).json({ 
                message: 'Usuário criado com sucesso',
                userId: result 
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    },

    async login(req, res) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ 
                    error: 'Email e senha são obrigatórios' 
                });
            }

            const usuario = await usuariosModel.verifyPassword(email, senha);

            if (!usuario) {
                return res.status(401).json({ 
                    error: 'Credenciais inválidas' 
                });
            }

            if (!usuario.ativo) {
                return res.status(403).json({ 
                    error: 'Usuário inativo' 
                });
            }

            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    email: usuario.email, 
                    role: usuario.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login realizado com sucesso',
                token,
                user: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    role: usuario.role
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao realizar login' });
        }
    },

    async loginAuth0(req, res) {
        try {
            const { email, senha } = req.body;

            if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_CLIENT_ID) {
                return res.status(500).json({ 
                    error: 'Auth0 não está configurado' 
                });
            }

            const response = await axios.post(
                `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
                {
                    grant_type: 'password',
                    username: email,
                    password: senha,
                    client_id: process.env.AUTH0_CLIENT_ID,
                    client_secret: process.env.AUTH0_CLIENT_SECRET,
                    audience: process.env.AUTH0_AUDIENCE,
                    scope: 'openid profile email'
                }
            );

            res.json({
                message: 'Login Auth0 realizado com sucesso',
                token: response.data.access_token,
                id_token: response.data.id_token
            });
        } catch (error) {
            console.log(error);
            res.status(401).json({ 
                error: 'Falha na autenticação Auth0' 
            });
        }
    },

    async me(req, res) {
        try {
            const usuario = await usuariosModel.findById(req.user.id);
            
            if (usuario === -1) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            res.json({ user: usuario });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
    },

    async refreshToken(req, res) {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ error: 'Token não fornecido' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const usuario = await usuariosModel.findById(decoded.id);

            if (usuario === -1 || !usuario.ativo) {
                return res.status(401).json({ error: 'Usuário inválido' });
            }

            const newToken = jwt.sign(
                { 
                    id: usuario.id, 
                    email: usuario.email, 
                    role: usuario.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Token renovado com sucesso',
                token: newToken
            });
        } catch (error) {
            console.log(error);
            res.status(401).json({ error: 'Token inválido ou expirado' });
        }
    }
};
