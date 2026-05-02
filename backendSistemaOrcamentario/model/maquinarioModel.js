const db = require("../src/database/connection.js");

module.exports = {
    async findAll() {
        try {
            const maquinarios = await db("Maquinarios").select("*");
            return maquinarios;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async findById(machineId) {
        try {
            const machine = await db("Maquinarios").where({ id: machineId }).first();
            if (!machine) {
                return -1
            } else {
                return machine;
            }
        } catch (error) {
            console.log(error);
        }

    },

    async create(machine) {
        try {
            const result = await db("Maquinarios").insert(machine);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async createWithFornecedores(machine, fornecedorIds) {
        const trx = await db.transaction();

        try {
            const machineResult = await trx("Maquinarios").insert(machine).returning('id');
            const maquinarioId = Array.isArray(machineResult) ? machineResult[0].id : machineResult.id;

            const fornecedoresNormalizados = Array.isArray(fornecedorIds)
                ? [...new Set(fornecedorIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))]
                : [];

            for (const fornecedorId of fornecedoresNormalizados) {
                const existingAssociation = await trx('FornecedorMaquinario')
                    .where({ maquinarioId, fornecedorId })
                    .first();

                if (!existingAssociation) {
                    await trx('FornecedorMaquinario').insert({ maquinarioId, fornecedorId });
                }
            }

            await trx.commit();
            return machineResult;
        } catch (error) {
            await trx.rollback();
            console.log(error);
            throw error;
        }
    },
    async update(machine) {
        try {
            const result = await db("Maquinarios").where({ id: machine.id }).update(machine);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    async delete(machineId) {
        try {
            const machine = await db("Maquinarios").where({ id: machineId }).del();

            return machine;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    ,
    async getFornecedores(maquinarioId) {
        try {
            const fornecedores = await db('FornecedorMaquinario')
                .select('Fornecedor.*')
                .join('Fornecedor', 'FornecedorMaquinario.fornecedorId', 'Fornecedor.id')
                .where('FornecedorMaquinario.maquinarioId', maquinarioId);
            return fornecedores;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async addFornecedor(maquinarioId, fornecedorId) {
        try {
            const association = { maquinarioId, fornecedorId };
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

    async removeFornecedor(maquinarioId, fornecedorId) {
        try {
            return await db('FornecedorMaquinario').where({ maquinarioId, fornecedorId }).del();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}