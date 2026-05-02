const orcamentoModel = require('../model/orcamentoModel');
const db = require('../src/database/connection.js');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

const hasClienteAccess = (req, clienteId) => {
    const clienteIdNumber = Number(clienteId);

    if (Array.isArray(req.clienteIds)) {
        return req.clienteIds.includes(clienteIdNumber);
    }

    if (req.clienteId) {
        return Number(req.clienteId) === clienteIdNumber;
    }

    return true;
};

const formatCurrency = (value) => {
    const numeric = Number(value) || 0;
    return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (date) => {
    if (!date) return '-';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return '-';
    }

    return parsedDate.toLocaleDateString('pt-BR');
};

const sanitizeFileName = (value) => {
    return String(value || 'orcamento')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
};

module.exports = {

    async findAll(req, res) {
        try {
            const budgets = Array.isArray(req.clienteIds)
                ? await orcamentoModel.findByClienteIds(req.clienteIds)
                : req.clienteId
                    ? await orcamentoModel.findByClienteId(req.clienteId)
                    : await orcamentoModel.findAll();
            return res.json(budgets);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar os orçamentos." });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const result = await orcamentoModel.findById(id);

            if (result === -1) {
                return res.status(404).json({ message: "Orçamento não encontrado" });
            }

            // Verifica se o usuário tem permissão para ver este orçamento
            const projeto = await db('Projetos').where({ id: result.projetoId }).first();
            if (projeto && !hasClienteAccess(req, projeto.clienteId)) {
                return res.status(403).json({ message: "Acesso negado a este orçamento." });
            }

            return res.json(result);
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao buscar o orçamento." });
        }
    },

    async create(req, res) {
        try {
            var allBudgetData = req.body;
            const projetoId = Number(allBudgetData.projetoId);

            const projeto = await db('Projetos').where({ id: projetoId }).first();

            if (!projeto) {
                return res.status(404).json({ message: "Projeto não encontrado" });
            }

            if (!hasClienteAccess(req, projeto.clienteId)) {
                return res.status(403).json({ message: "Acesso negado para vincular orçamento a este projeto." });
            }

            var budget = {
                nome: allBudgetData.nome,
                dataCriacao: allBudgetData.dataCriacao,
                status: allBudgetData.status,
                projetoId,
            }

            var result = await orcamentoModel.create(budget);

            if (result === "NOME_EXISTS") {
                return res.status(400).json({ message: "Orcamento já cadastrado!" });
            }

            if (typeof result === 'object') {
                return res.status(201).json({ message: "Orçamento cadastrado com sucesso!" });
            }

            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o orçamento." });
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao cadastrar o orçamento." });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            var allBudgetData = req.body;

            const existingBudget = await orcamentoModel.findById(id);

            if (existingBudget === -1) {
                return res.status(404).json({ message: "Orçamento não encontrado" });
            }

            const currentProject = await db('Projetos').where({ id: existingBudget.projetoId }).first();

            if (!currentProject || !hasClienteAccess(req, currentProject.clienteId)) {
                return res.status(403).json({ message: "Acesso negado para editar este orçamento." });
            }

            const targetProject = await db('Projetos').where({ id: allBudgetData.projetoId }).first();

            if (!targetProject) {
                return res.status(404).json({ message: "Projeto não encontrado" });
            }

            if (!hasClienteAccess(req, targetProject.clienteId)) {
                return res.status(403).json({ message: "Acesso negado para vincular orçamento a este projeto." });
            }

            var budget = {
                id: id,
                nome: allBudgetData.nome,
                dataCriacao: allBudgetData.dataCriacao,
                status: allBudgetData.status,
                projetoId: allBudgetData.projetoId,
            }

            if (allBudgetData.photoUri) budget.photoUri = allBudgetData.photoUri;

            var result = await orcamentoModel.update(budget);

            if (result === 0) {
                return res.status(404).json({ message: "Orçamento não encontrado" });
            } else {
                return res.status(200).json({ message: "Orçamento atualizado com sucesso!" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Ocorreu um erro ao atualizar o orçamento." });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const budget = await orcamentoModel.findById(id);

            if (budget === -1) {
                return res.status(404).json({ message: "Orçamento não encontrado" });
            }

            const projeto = await db('Projetos').where({ id: budget.projetoId }).first();

            if (!projeto || !hasClienteAccess(req, projeto.clienteId)) {
                return res.status(403).json({ message: "Acesso negado para deletar este orçamento." });
            }

            await orcamentoModel.delete(id);

            return res.status(200).json("Deletado com sucesso!");
        } catch (error) {
            console.log(error.toString());
            return res.status(500).json(JSON.stringify(error));
        }

    },

    async testUpdateValorTotal(req, res) {
        try {
            const { id } = req.params;
            const valorTotal = await orcamentoModel.updateValorTotalItens(id);
            return res.json({ 
                message: "Valor total atualizado com sucesso!", 
                valorTotalItens: valorTotal 
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Erro ao atualizar valor total", error: error.message });
        }
    },

    async getAllProjetos(req, res) {
        try {
            const projetos = Array.isArray(req.clienteIds)
                ? await orcamentoModel.getProjetosByClienteIds(req.clienteIds)
                : req.clienteId
                    ? await orcamentoModel.getProjetosByClienteIds([req.clienteId])
                    : await orcamentoModel.getAllProjetos();
            return res.status(200).json(projetos);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao buscar projetos" });
        }
    },

    async getProjetosByOrcamentoId(req, res) {
        try {
            const { id } = req.params;
            const projetos = await orcamentoModel.getProjetosByOrcamentoId(id);
            
            if (projetos === "ORCAMENTO_NOT_FOUND") {
                return res.status(404).json({ message: "Orçamento não encontrado" });
            }

            const projeto = projetos[0];
            if (projeto) {
                const projetoCompleto = await db('Projetos').where({ id: projeto.value }).first();
                if (projetoCompleto && !hasClienteAccess(req, projetoCompleto.clienteId)) {
                    return res.status(403).json({ message: "Acesso negado a este orçamento." });
                }
            }
            
            return res.status(200).json(projetos);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Erro ao buscar projetos do orçamento" });
        }
    },

    async exportPdf(req, res) {
        try {
            const { id } = req.params;
            const exportData = await orcamentoModel.findExportDataById(id);

            if (exportData === -1) {
                return res.status(404).json({ message: 'Orçamento não encontrado.' });
            }

            if (req.clienteId && exportData.orcamento.clienteId !== req.clienteId) {
                return res.status(403).json({ message: 'Acesso negado a este orçamento.' });
            }

            const safeName = sanitizeFileName(exportData.orcamento.nome);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="orcamento-${safeName || id}.pdf"`);

            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            doc.pipe(res);

            doc.fontSize(18).text('Orçamento', { align: 'left' });
            doc.moveDown(0.6);

            doc.fontSize(11);
            doc.text(`Nome: ${exportData.orcamento.nome}`);
            doc.text(`Projeto: ${exportData.orcamento.projetoNome}`);
            doc.text(`Cliente: ${exportData.orcamento.clienteNome}`);
            doc.text(`Data de Criação: ${formatDate(exportData.orcamento.dataCriacao)}`);
            doc.text(`Status: ${exportData.orcamento.status}`);
            doc.text(`Valor Total: ${formatCurrency(exportData.orcamento.valorTotalItens)}`);
            doc.moveDown();

            doc.fontSize(13).text('Itens do Orçamento');
            doc.moveDown(0.4);

            if (!exportData.itens.length) {
                doc.fontSize(11).text('Este orçamento não possui itens cadastrados.');
                doc.end();
                return;
            }

            doc.fontSize(10).text('Tipo | Descrição | Qtd | Vlr. Unitário | Vlr. Total');
            doc.moveDown(0.3);

            exportData.itens.forEach((item) => {
                if (doc.y > 760) {
                    doc.addPage();
                    doc.fontSize(10).text('Tipo | Descrição | Qtd | Vlr. Unitário | Vlr. Total');
                    doc.moveDown(0.3);
                }

                const line = `${item.tipo} | ${item.descricao} | ${item.quantidade} | ${formatCurrency(item.valorUnitario)} | ${formatCurrency(item.valorTotal)}`;
                doc.text(line, { width: 520 });
            });

            doc.end();
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao exportar orçamento em PDF.' });
        }
    },

    async exportExcel(req, res) {
        try {
            const { id } = req.params;
            const exportData = await orcamentoModel.findExportDataById(id);

            if (exportData === -1) {
                return res.status(404).json({ message: 'Orçamento não encontrado.' });
            }

            if (req.clienteId && exportData.orcamento.clienteId !== req.clienteId) {
                return res.status(403).json({ message: 'Acesso negado a este orçamento.' });
            }

            const safeName = sanitizeFileName(exportData.orcamento.nome);
            const valorTotalOrcamento = exportData.itens.reduce(
                (acc, item) => acc + (Number(item.valorTotal) || 0),
                0
            );

            const resumoRows = [
                { Informacao: 'Nome do Orçamento', Detalhe: exportData.orcamento.nome },
                { Informacao: 'Projeto', Detalhe: exportData.orcamento.projetoNome },
                { Informacao: 'Cliente', Detalhe: exportData.orcamento.clienteNome },
                { Informacao: 'Data de Criação', Detalhe: formatDate(exportData.orcamento.dataCriacao) },
                { Informacao: 'Status', Detalhe: exportData.orcamento.status },
                { Informacao: 'Valor Total do Orçamento', Detalhe: formatCurrency(valorTotalOrcamento) }
            ];

            const itensRows = exportData.itens.map((item) => ({
                'Tipo de Item': item.tipo,
                'Descrição': item.descricao,
                Quantidade: item.quantidade,
                'Valor Unitário (R$)': formatCurrency(item.valorUnitario),
                'Valor Total do Item (R$)': formatCurrency(item.valorTotal),
                'Valor Total do Orçamento (R$)': formatCurrency(valorTotalOrcamento)
            }));

            const wb = XLSX.utils.book_new();
            const wsResumo = XLSX.utils.json_to_sheet(resumoRows);
            const wsItens = XLSX.utils.json_to_sheet(
                itensRows.length
                    ? itensRows
                    : [{
                        'Tipo de Item': '-',
                        'Descrição': 'Este orçamento não possui itens cadastrados.',
                        Quantidade: 0,
                        'Valor Unitário (R$)': formatCurrency(0),
                        'Valor Total do Item (R$)': formatCurrency(0),
                        'Valor Total do Orçamento (R$)': formatCurrency(valorTotalOrcamento)
                    }]
            );

            wsResumo['!cols'] = [{ wch: 30 }, { wch: 50 }];
            wsItens['!cols'] = [{ wch: 18 }, { wch: 40 }, { wch: 12 }, { wch: 20 }, { wch: 22 }, { wch: 30 }];

            XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
            XLSX.utils.book_append_sheet(wb, wsItens, 'Itens');

            const fileBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="orcamento-${safeName || id}.xlsx"`);

            return res.send(fileBuffer);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Erro ao exportar orçamento em Excel.' });
        }
    },
}