const db = require('../src/database/connection.js');
const cargoModel = require('../model/cargoModel');
const {
    buildTemplateBuffer,
    buildWorkbookBuffer,
    parseExcelBuffer,
    sendExcelFile,
    buildNameMap,
    getCellValue,
    normalizeKey,
} = require('../utils/excelService');

const CARGOS_TEMPLATE_COLUMNS = ['Nome', 'Área'];

module.exports = {

    async findAll(req, res) {
        try {
            const occupation = await cargoModel.findAll();
            return res.json(occupation);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os cargos." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await cargoModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Cargo não encontrado" });
            } else {
                return res.json(result);
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o cargo." });
        }
    },

    async create(req, res) {
        try {
            const allOccupationData = req.body;

            const occupation = {
                nome: allOccupationData.nome,
                areaId: allOccupationData.areaId,
            }
            const result = await cargoModel.create(occupation);

            if (result === "CARGO_EXISTS") {
                return res.status(400).json({ message: "Já existe um cargo com este nome nesta área." });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Cargo cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o cargo." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o cargo." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const allOccupationData = req.body;

            const occupation = {
                id: id,
                nome: allOccupationData.nome,
                areaId: allOccupationData.areaId,
            }

            const result = await cargoModel.update(occupation);

            if (result === "CARGO_EXISTS") {
                return res.status(400).json({ message: "Já existe um cargo com este nome nesta área." });
            }

            if (result === 0) {
                return res.status(404).json({ message: "Cargo não encontrado!" });
            } else {
                return res.status(200).json({ message: "Cargo atualizado com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao editar o cargo." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await cargoModel.delete(id);

            if (result === 0) {
                return res.status(404).json({ message: "Cargo não encontrado!" });
            }

            return res.status(200).json({ message: "Cargo deletado com sucesso!" });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao deletar o cargo." });
        }
    },

    async exportTemplate(req, res) {
        try {
            const buffer = buildTemplateBuffer(CARGOS_TEMPLATE_COLUMNS);
            return sendExcelFile(res, 'modelo-cargos.xlsx', buffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao exportar modelo de cargos.' });
        }
    },

    async exportList(req, res) {
        try {
            const cargos = await cargoModel.findAll();
            const rows = cargos.map((cargo) => ({
                ID: cargo.id,
                Nome: cargo.nome,
                Area: cargo.areaNome || '',
            }));
            const columns = ['ID', 'Nome', 'Area'];
            const buffer = buildWorkbookBuffer(rows, columns, 'Cargos');

            return sendExcelFile(res, 'cargos-cadastrados.xlsx', buffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao exportar lista de cargos.' });
        }
    },

    async importExcel(req, res) {
        try {
            const { file } = req.body;

            if (!file) {
                return res.status(400).json({ message: 'Arquivo Excel não enviado.' });
            }

            const buffer = Buffer.from(file, 'base64');
            const rows = parseExcelBuffer(buffer).filter((row) => {
                const nome = getCellValue(row, ['Nome', 'nome']);
                const area = getCellValue(row, ['Área', 'Area', 'area']);

                return nome || area;
            });

            if (rows.length === 0) {
                return res.status(400).json({ message: 'A planilha está vazia ou não possui dados válidos.' });
            }

            const areas = await db('Areas').select('id', 'nome');
            const areaMap = buildNameMap(areas);

            let imported = 0;
            const errors = [];

            for (let index = 0; index < rows.length; index += 1) {
                const row = rows[index];
                const rowNumber = index + 2;
                const nome = getCellValue(row, ['Nome', 'nome']);
                const areaNome = getCellValue(row, ['Área', 'Area', 'area']);

                if (!nome || !areaNome) {
                    errors.push({ row: rowNumber, message: 'Preencha Nome e Área.' });
                    continue;
                }

                const areaId = areaMap.get(normalizeKey(areaNome));

                if (!areaId) {
                    errors.push({ row: rowNumber, message: `Área "${areaNome}" não encontrada.` });
                    continue;
                }

                try {
                    const result = await cargoModel.create({ nome, areaId });

                    if (result === 'CARGO_EXISTS') {
                        errors.push({ row: rowNumber, message: `Cargo "${nome}" já cadastrado nesta área.` });
                        continue;
                    }

                    imported += 1;
                } catch (error) {
                    console.log(error);
                    errors.push({ row: rowNumber, message: 'Erro ao cadastrar cargo.' });
                }
            }

            const message = imported > 0
                ? `Importação concluída: ${imported} cargo(s) importado(s).`
                : 'Nenhum cargo foi importado.';

            return res.status(200).json({ message, imported, errors });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao importar cargos.' });
        }
    },
}
