const db = require('../src/database/connection.js');
const bcrypt = require('bcrypt');

module.exports = {
    async findAll() {
        try {
            const usuarios = await db('Usuarios')
                .select('id', 'nome', 'email', 'role', 'ativo', 'createdAt', 'updatedAt');
            return usuarios;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async findById(usuarioId) {
        try {
            const usuario = await db('Usuarios')
                .where({ id: usuarioId })
                .select('id', 'nome', 'email', 'role', 'ativo', 'createdAt', 'updatedAt')
                .first();
            return usuario ? usuario : -1;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async findByEmail(email) {
        try {
            const usuario = await db('Usuarios')
                .where({ email })
                .first();
            return usuario;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async create(usuario) {
        try {
            const existingUser = await this.findByEmail(usuario.email);
            
            if (existingUser) {
                return "EMAIL_EXISTS";
            }

            const hashedPassword = await bcrypt.hash(usuario.senha, 10);

            const clientName = db.client && db.client.config && db.client.config.client;

            if (clientName === 'pg') {
                const inserted = await db('Usuarios')
                    .insert({
                        nome: usuario.nome,
                        email: usuario.email,
                        senha: hashedPassword,
                        role: usuario.role || 'user',
                        ativo: true,
                        createdAt: db.fn.now(),
                        updatedAt: db.fn.now()
                    })
                    .returning('id');

                return Array.isArray(inserted)
                    ? (inserted[0]?.id || inserted[0])
                    : inserted;
            }

            const inserted = await db('Usuarios').insert({
                nome: usuario.nome,
                email: usuario.email,
                senha: hashedPassword,
                role: usuario.role || 'user',
                ativo: true,
                createdAt: db.fn.now(),
                updatedAt: db.fn.now()
            });

            return Array.isArray(inserted) ? inserted[0] : inserted;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async update(usuario) {
        try {
            const existingUser = await db('Usuarios')
                .where({ email: usuario.email })
                .andWhereNot({ id: usuario.id })
                .first();

            if (existingUser) {
                return "EMAIL_EXISTS";
            }

            const updateData = {
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role,
                ativo: usuario.ativo,
                updatedAt: db.fn.now()
            };

            if (usuario.senha) {
                updateData.senha = await bcrypt.hash(usuario.senha, 10);
            }

            const result = await db('Usuarios')
                .where({ id: usuario.id })
                .update(updateData);
            
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(usuarioId) {
        try {
            const result = await db('Usuarios')
                .where({ id: usuarioId })
                .del();
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async verifyPassword(email, senha) {
        try {
            const usuario = await this.findByEmail(email);
            
            if (!usuario) {
                return false;
            }

            const isValid = await bcrypt.compare(senha, usuario.senha);
            return isValid ? usuario : false;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
};
