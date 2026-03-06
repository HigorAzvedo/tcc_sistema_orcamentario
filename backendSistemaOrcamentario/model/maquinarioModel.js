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
}