const bcrypt = require('bcrypt');

async function generatePasswordHash() {
  try {
    // Configure aqui a senha que deseja gerar o hash
    const senha = 'admin123'; // TROQUE pela senha desejada

    console.log('');
    console.log('========================================');
    console.log('  GERAR HASH DE SENHA (BCRYPT)');
    console.log('========================================');
    console.log('');
    console.log('🔐 Gerando hash para a senha...');
    
    const hashedPassword = await bcrypt.hash(senha, 10);

    console.log('');
    console.log('✅ Hash gerado com sucesso!');
    console.log('');
    console.log('📋 Informações:');
    console.log('   Senha original:', senha);
    console.log('   Hash gerado:', hashedPassword);
    console.log('');
    console.log('📝 Use este hash para atualizar diretamente no banco de dados:');
    console.log('');
    console.log(`   UPDATE Usuarios SET senha = '${hashedPassword}' WHERE email = 'usuario@email.com';`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao gerar hash:', error);
    process.exit(1);
  }
}

// Executa a função
generatePasswordHash();
