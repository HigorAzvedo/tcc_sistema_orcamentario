const db = require('../src/database/connection.js');

module.exports = {

    async findAll() {
    try {
        const materiais = await db('Materiais')
            .select(
                'Materiais.*',
                'Areas.nome as areaNome'
            )
            .leftJoin('Areas', 'Materiais.areaId', 'Areas.id');
        return materiais;
    } catch (error) {
        console.log(error);
        throw error;
    }
},

    async findById(materialsId) {
        try {
            const material = await db('Materiais').where({ id: materialsId }).first();
            return material ? material : -1;
        } catch (error) {
            console.log(error);
            throw error;
        }

    },

    async create(material) {
        try {
            const result = await db('Materiais').insert(material);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async createWithFornecedores(material, fornecedorIds) {
        const trx = await db.transaction();

        try {
            const materialResult = await trx('Materiais').insert(material).returning('id');
            const materialId = Array.isArray(materialResult) ? materialResult[0].id : materialResult.id;

            const fornecedoresNormalizados = Array.isArray(fornecedorIds)
                ? [...new Set(fornecedorIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))]
                : [];

            for (const fornecedorId of fornecedoresNormalizados) {
                const existingAssociation = await trx('FornecedorMaterial')
                    .where({ materialId, fornecedorId })
                    .first();

                if (!existingAssociation) {
                    await trx('FornecedorMaterial').insert({ materialId, fornecedorId });
                }
            }

            await trx.commit();
            return materialResult;
        } catch (error) {
            await trx.rollback();
            console.log(error);
            throw error;
        }
    },

    async update(material) {
        try {
            const result = await db('Materiais').where({ id: material.id }).update(material);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(materialsId) {
        try {
            const result = await db('Materiais').where({ id: materialsId }).del();
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async addFornecedor(materialId, fornecedorId) {
        try {
            const association = { materialId, fornecedorId };
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

    async removeFornecedor(materialId, fornecedorId) {
        try {
            return await db('FornecedorMaterial').where({ materialId, fornecedorId }).del();
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async getFornecedores(materialId) {
        try {
            const fornecedores = await db('FornecedorMaterial')
                .select(
                    'Fornecedor.*'
                )
                .join('Fornecedor', 'FornecedorMaterial.fornecedorId', 'Fornecedor.id')
                .where('FornecedorMaterial.materialId', materialId);
            return fornecedores;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}