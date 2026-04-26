const db = require('../src/database/connection.js');
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    // Configure aqui os dados do administrador
    const adminData = {
      nome: 'Administrador',
      email: 'admin@sistema.com',
      senha: 'admin123', // TROQUE esta senha!
      role: 'admin'
    };

    console.log('🔍 Verificando se o email já existe...');
    
    // Verifica se o email já existe
    const existingUser = await db('Usuarios')
      .where({ email: adminData.email })
      .first();

    if (existingUser) {
      console.log('❌ Erro: Já existe um usuário com este email:', adminData.email);
      process.exit(1);
    }

    console.log('🔐 Criptografando senha...');
    
    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(adminData.senha, 10);

    console.log('💾 Criando usuário administrador...');
    
    // Cria o usuário
    const insertResult = await db('Usuarios').insert({
      nome: adminData.nome,
      email: adminData.email,
      senha: hashedPassword,
      role: adminData.role,
      ativo: true,
      createdAt: db.fn.now(),
      updatedAt: db.fn.now()
    }).returning('id');

    const userId = Array.isArray(insertResult)
      ? (typeof insertResult[0] === 'object' ? insertResult[0].id : insertResult[0])
      : insertResult;

    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📋 Detalhes:');
    console.log('   ID:', userId);
    console.log('   Nome:', adminData.nome);
    console.log('   Email:', adminData.email);
    console.log('   Role:', adminData.role);
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
    process.exit(1);
  }
}

// Executa a função
createAdmin();

// cd backendSistemaOrcamentario
// npm run create-admin-quick

// npm run create-admin       # Script interativo (recomendado)
// npm run create-admin-quick # Script rápido pré-configurado
