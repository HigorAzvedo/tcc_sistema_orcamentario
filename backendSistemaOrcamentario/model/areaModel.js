const db = require('../src/database/connection.js');

module.exports = {

    async findAll() {
        try {
            const areas = await db('Areas').select('*');
            return areas;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async findById(areaId) {
        try {
            const area = await db('Areas').where({ id: areaId }).first();
            return area ? area : -1;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async create(area) {
        try {
            const existingArea = await db('Areas')
                .where({ nome: area.nome })
                .first();

            if (existingArea) {
                return "AREA_EXISTS";
            }

            const result = await db('Areas').insert(area);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async update(area) {
        try {
            const existingArea = await db('Areas')
                .where({ nome: area.nome })
                .andWhereNot({ id: area.id })
                .first();

            if (existingArea) {
                return "AREA_EXISTS";
            }

            const result = await db('Areas').where({ id: area.id }).update(area);
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },

    async delete(areaId) {
        try {
            const result = await db('Areas').where({ id: areaId }).del();
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}