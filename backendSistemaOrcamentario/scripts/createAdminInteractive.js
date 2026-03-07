const db = require('../src/database/connection.js');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminInteractive() {
  try {
    console.log('');
    console.log('========================================');
    console.log('  CRIAR NOVO USUÁRIO ADMINISTRADOR');
    console.log('========================================');
    console.log('');

    const nome = await question('Nome completo: Higor ADM');
    const email = await question('Email: higoradm@teste.com');
    const senha = await question('Senha (mínimo 6 caracteres): abc123');

    // Validações
    if (!nome || nome.trim().length < 3) {
      console.log('❌ Nome deve ter pelo menos 3 caracteres');
      rl.close();
      process.exit(1);
    }

    if (!email || !email.includes('@')) {
      console.log('❌ Email inválido');
      rl.close();
      process.exit(1);
    }

    if (!senha || senha.length < 6) {
      console.log('❌ Senha deve ter pelo menos 6 caracteres');
      rl.close();
      process.exit(1);
    }

    console.log('');
    console.log('🔍 Verificando se o email já existe...');
    
    // Verifica se o email já existe
    const existingUser = await db('Usuarios')
      .where({ email: email.toLowerCase() })
      .first();

    if (existingUser) {
      console.log('❌ Erro: Já existe um usuário com este email');
      rl.close();
      process.exit(1);
    }

    console.log('🔐 Criptografando senha...');
    
    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    console.log('💾 Criando usuário administrador...');
    
    // Cria o usuário
    const [userId] = await db('Usuarios').insert({
      nome: nome.trim(),
      email: email.toLowerCase(),
      senha: hashedPassword,
      role: 'admin',
      ativo: true,
      createdAt: db.fn.now(),
      updatedAt: db.fn.now()
    });

    console.log('');
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('');
    console.log('📋 Detalhes:');
    console.log('   ID:', userId);
    console.log('   Nome:', nome);
    console.log('   Email:', email);
    console.log('   Role: admin');
    console.log('');
    console.log('🔑 Use estas credenciais para fazer login no sistema');
    console.log('');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
    rl.close();
    process.exit(1);
  }
}

// Executa a função
createAdminInteractive();

// cd backendSistemaOrcamentario
// npm run create-admin-quick

// npm run create-admin       # Script interativo (recomendado)
// npm run create-admin-quick # Script rápido pré-configurado