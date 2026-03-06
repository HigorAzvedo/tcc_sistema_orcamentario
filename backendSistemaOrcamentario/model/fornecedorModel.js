const db = require('../src/database/connection.js');

module.exports = {

    async findAll() {
        try {
            const fornecedores = await db('Fornecedor').select('*');
            return fornecedores;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async findById(supplierId) {
        try {
            const fornecedor = await db('Fornecedor').where({ id: supplierId }).first();
            return fornecedor ? fornecedor : -1;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async create(supplier) {
        try {
            const existingFornecedor = await db('Fornecedor')
                .where({ email: supplier.email })
                .orWhere({ cnpj: supplier.cnpj })
                .orWhere({ telefone: supplier.telefone })
                .orWhere({ nome: supplier.nome })
                .first();

            if (existingFornecedor) {
                if(existingFornecedor.nome === supplier.nome) {
                    return "NOME_EXISTS";
                }
                if (existingFornecedor.email === supplier.email) {
                    return "EMAIL_EXISTS";
                }
                if (existingFornecedor.cnpj === supplier.cnpj) {
                    return "CNPJ_EXISTS";
                }
                if (existingFornecedor.telefone === supplier.telefone) {
                    return "TELEFONE_EXISTS";
                }
            }

            const result = await db('Fornecedor').insert(supplier);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async update(supplier) {
        try {
            const existingFornecedor = await db('Fornecedor')
                .where(function () {
                    this.where({ email: supplier.email })
                        .orWhere({ cnpj: supplier.cnpj })
                        .orWhere({ telefone: supplier.telefone })
                        .orWhere({ nome: supplier.nome })
                })
                .andWhereNot({ id: supplier.id })
                .first();

            if (existingFornecedor) {
                if (existingFornecedor.nome === supplier.nome) {
                    return "NOME_EXISTS";
                }
                if (existingFornecedor.email === supplier.email) {
                    return "EMAIL_EXISTS";
                }
                if (existingFornecedor.cnpj === supplier.cnpj) {
                    return "CNPJ_EXISTS";
                }
                if (existingFornecedor.telefone === supplier.telefone) {
                    return "TELEFONE_EXISTS";
                }
            }

            const result = await db('Fornecedor').where({ id: supplier.id }).update(supplier);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(supplierId) {
        try {
            const result = await db('Fornecedor').where({ id: supplierId }).del();
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async addMaterial(fornecedorId, materialId) {
        try {
            const association = { fornecedorId, materialId };
            const existingAssociation = await db('FornecedorMaterial').where(association).first();
            if (existingAssociation) {
                return "ASSOCIATION_EXISTS";
            }
            return await db('FornecedorMaterial').insert(association);
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async removeMaterial(fornecedorId, materialId) {
        try {
            return await db('FornecedorMaterial').where({ fornecedorId, materialId }).del();
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async addMaquinario(fornecedorId, maquinarioId) {
        try {
            const association = { fornecedorId, maquinarioId };
            const existingAssociation = await db('FornecedorMaquinario').where(association).first();
            if (existingAssociation) {
                return "ASSOCIATION_EXISTS";
            }
            return await db('FornecedorMaquinario').insert(association);
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async removeMaquinario(fornecedorId, maquinarioId) {
        try {
            return await db('FornecedorMaquinario').where({ fornecedorId, maquinarioId }).del();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}