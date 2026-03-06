const db = require('../src/database/connection.js');

module.exports = {

    async findAll() {
        try {
            const clientes = await db('Cliente').select('*');
            return clientes;
        } catch (error) {
            throw error;
        }
    },

    async findById(id) {
        try {
            const existingClient = await db('Cliente').where({ id: id }).first();
            if (!existingClient) {
                return -1;
            } else {
                return existingClient;
            }
        } catch (error) {
            throw error;
        }
    },

     async create(cliente) {
        try {
            const existingClient = await db('Cliente')
                .where({ email: cliente.email })
                .orWhere({ cpfCnpj: cliente.cpfCnpj })
                .first();

            if (existingClient) {
                if (existingClient.email === cliente.email) {
                    return "EMAIL_EXISTS";
                }
                if (existingClient.cpfCnpj === cliente.cpfCnpj) {
                    return "CPF_CNPJ_EXISTS";
                }
            }

            const result = await db('Cliente').insert(cliente);
            return result;
        } catch (error) {
            throw error;
        }
    },

    async update(cliente) {
        try {
            const existingClient = await db('Cliente')
                .where(function() {
                    this.where({ email: cliente.email })
                        .orWhere({ cpfCnpj: cliente.cpfCnpj });
                })
                .andWhereNot({ id: cliente.id })
                .first();

            if (existingClient) {
                if (existingClient.email === cliente.email) {
                    return "EMAIL_EXISTS";
                }
                if (existingClient.cpfCnpj === cliente.cpfCnpj) {
                    return "CPF_CNPJ_EXISTS";
                }
            }

            const result = await db('Cliente').where({ id: cliente.id }).update(cliente);

            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(id) {
        try {
            // Buscar o cliente para verificar se tem usuário vinculado
            const cliente = await db('Cliente').where({ id }).first();
            
            if (!cliente) {
                return 0;
            }
            
            // Se tem usuário vinculado, deletar o usuário primeiro
            if (cliente.usuarioId) {
                try {
                    await db('Usuarios').where({ id: cliente.usuarioId }).del();
                } catch (userDeleteError) {
                    // Silently continue if user deletion fails
                }
            }
            
            // Deletar o cliente
            const result = await db('Cliente').where({ id: id }).del();
            return result;
        } catch (error) {

            throw error;
        }
    },

    async findByUsuarioId(usuarioId) {
        try {
            const cliente = await db('Cliente').where({ usuarioId }).first();
            return cliente ? cliente : -1;
        } catch (error) {
            throw error;
        }
    },

    async linkUsuario(clienteId, usuarioId) {
        try {
            const result = await db('Cliente')
                .where({ id: clienteId })
                .update({ usuarioId });
            return result;
        } catch (error) {
            throw error;
        }
    },

    async unlinkUsuario(clienteId) {
        try {
            const result = await db('Cliente')
                .where({ id: clienteId })
                .update({ usuarioId: null });
            return result;
        } catch (error) {
            throw error;
        }
    }
}