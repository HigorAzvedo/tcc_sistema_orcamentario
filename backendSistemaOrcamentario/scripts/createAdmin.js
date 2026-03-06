require('dotenv').config();
const usuariosModel = require('../model/usuariosModel');

async function createAdmin() {
    try {
        console.log('Criando usuário administrador...');
        
        const adminData = {
            nome: 'Administrador',
            email: 'admin@sistema.com',
            senha: 'admin123',
            role: 'admin'
        };

        const result = await usuariosModel.create(adminData);

        if (result === "EMAIL_EXISTS") {
            console.log('❌ Erro: Email já cadastrado no sistema.');
            process.exit(1);
        }

        console.log('✅ Usuário administrador criado com sucesso!');
        console.log('📧 Email:', adminData.email);
        console.log('🔑 Senha:', adminData.senha);
        console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar administrador:', error);
        process.exit(1);
    }
}

createAdmin();
