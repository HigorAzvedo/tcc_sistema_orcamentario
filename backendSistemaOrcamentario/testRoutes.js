require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

// Importar rotas
const clienteRoutes = require('./routes/clientes');
app.use('/clientes', clienteRoutes);

// Listar todas as rotas registradas
console.log('=== ROTAS REGISTRADAS ===\n');

function listRoutes(stack, prefix = '') {
    stack.forEach(middleware => {
        if (middleware.route) {
            const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
            console.log(`${methods}\t${prefix}${middleware.route.path}`);
        } else if (middleware.name === 'router') {
            const routerPath = middleware.regexp.source
                .replace('\\/?', '')
                .replace('(?=\\/|$)', '')
                .replace('^\\', '/')
                .replace('\\/', '/');
            listRoutes(middleware.handle.stack, routerPath);
        }
    });
}

listRoutes(app._router.stack);

console.log('\n=== TESTE: VINCULAR USUARIO ===');
console.log('Rota esperada: POST /clientes/cliente/:id/vincular-usuario');
