const db = require('../src/database/connection.js');

module.exports = {

    async findAll() {
        try {
            const orcamentistas = await db('Orcamentistas').select('*');
            return orcamentistas;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async findById(orcamentistaId) {
        try {
            const orcamentista = await db('Orcamentistas').where({ id: orcamentistaId }).first();
            return orcamentista ? orcamentista : -1;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async create(orcamentista) {
        try {
            const existingOrcamentista = await db('Orcamentistas')
                .where({ email: orcamentista.email })
                .orWhere({ matricula: orcamentista.matricula })
                .first();

            if (existingOrcamentista) {
                if (existingOrcamentista.email === orcamentista.email) {
                    return "EMAIL_EXISTS";
                }
                if (existingOrcamentista.matricula === orcamentista.matricula) {
                    return "MATRICULA_EXISTS";
                }
            }

            const result = await db('Orcamentistas').insert(orcamentista);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async update(orcamentista) {
        try {
            const existingOrcamentista = await db('Orcamentistas')
                .where(function() {
                    this.where({ email: orcamentista.email })
                        .orWhere({ matricula: orcamentista.matricula });
                })
                .andWhereNot({ id: orcamentista.id })
                .first();

            if (existingOrcamentista) {
                if (existingOrcamentista.email === orcamentista.email) {
                    return "EMAIL_EXISTS";
                }
                if (existingOrcamentista.matricula === orcamentista.matricula) {
                    return "MATRICULA_EXISTS";
                }
            }

            const result = await db('Orcamentistas').where({ id: orcamentista.id }).update(orcamentista);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(orcamentistaId) {
        try {
            const result = await db('Orcamentistas').where({ id: orcamentistaId }).del();
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}