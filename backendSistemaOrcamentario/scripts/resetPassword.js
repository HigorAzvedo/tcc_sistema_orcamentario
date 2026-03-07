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

async function resetPassword() {
  try {
    console.log('');
    console.log('========================================');
    console.log('  REDEFINIR SENHA DE USUÁRIO');
    console.log('========================================');
    console.log('');

    // Buscar todos os usuários
    const usuarios = await db('Usuarios')
      .select('id', 'nome', 'email', 'role')
      .orderBy('id');

    if (usuarios.length === 0) {
      console.log('❌ Nenhum usuário encontrado no sistema');
      rl.close();
      process.exit(1);
    }

    console.log('📋 Usuários disponíveis:');
    console.log('');
    usuarios.forEach(user => {
      console.log(`   [${user.id}] ${user.nome} (${user.email}) - Role: ${user.role}`);
    });
    console.log('');

    const userId = await question('Digite o ID do usuário: ');
    
    // Buscar o usuário selecionado
    const usuario = await db('Usuarios')
      .where({ id: parseInt(userId) })
      .first();

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      rl.close();
      process.exit(1);
    }

    console.log('');
    console.log('👤 Usuário selecionado:', usuario.nome);
    console.log('📧 Email:', usuario.email);
    console.log('');

    const novaSenha = await question('Nova senha (mínimo 6 caracteres): ');

    if (!novaSenha || novaSenha.length < 6) {
      console.log('❌ Senha deve ter pelo menos 6 caracteres');
      rl.close();
      process.exit(1);
    }

    const confirmarSenha = await question('Confirme a nova senha: ');

    if (novaSenha !== confirmarSenha) {
      console.log('❌ As senhas não coincidem');
      rl.close();
      process.exit(1);
    }

    console.log('');
    console.log('🔐 Criptografando nova senha...');
    
    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    console.log('💾 Atualizando senha no banco de dados...');
    
    // Atualiza a senha
    await db('Usuarios')
      .where({ id: usuario.id })
      .update({
        senha: hashedPassword,
        updatedAt: db.fn.now()
      });

    console.log('');
    console.log('✅ Senha alterada com sucesso!');
    console.log('');
    console.log('📋 Detalhes:');
    console.log('   Usuário:', usuario.nome);
    console.log('   Email:', usuario.email);
    console.log('   ID:', usuario.id);
    console.log('');
    console.log('🔑 O usuário já pode fazer login com a nova senha');
    console.log('');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
    rl.close();
    process.exit(1);
  }
}

// Executa a função
resetPassword();
