const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const usuariosRoutes = require('./routes/usuarios');
app.use('/usuarios', usuariosRoutes);

const clienteRoutes = require('./routes/clientes');
app.use('/clientes', clienteRoutes);

const projetoRoutes = require('./routes/projetos')
app.use('/projetos', projetoRoutes);

const orcamentistaRoutes = require('./routes/orcamentista')
app.use('/orcamentistas', orcamentistaRoutes);

const cargoRoutes = require('./routes/cargo')
app.use('/cargos', cargoRoutes);

const areaRoutes = require('./routes/areas')
app.use('/areas', areaRoutes);

const maquinarioRoutes = require('./routes/maquinario')
app.use('/maquinarios', maquinarioRoutes)

const budgetItemsRoutes = require('./routes/itensOrcamento')
app.use('/itensOrcamentos', budgetItemsRoutes)

const materialRoutes = require('./routes/materiais')
app.use('/materiais', materialRoutes)

const budgetRoutes = require('./routes/orcamento')
app.use('/orcamentos', budgetRoutes)

const supllierRoutes = require('./routes/fornecedor')
app.use('/fornecedores', supllierRoutes)

app.get('/', (req, res) => {
    res.json({ ok: true, message: 'Backend do sistema orcamentario ativo' });
});

if (require.main === module && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Servidor ativo na porta ${port}`)
    });
}

module.exports = app;

