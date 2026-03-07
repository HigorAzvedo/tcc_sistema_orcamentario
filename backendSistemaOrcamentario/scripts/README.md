# Scripts de Administração

Este diretório contém scripts utilitários para gerenciar o sistema.

## 📜 Scripts Disponíveis

### 1. `createAdminInteractive.js` (Recomendado)
Cria um administrador de forma interativa, solicitando os dados via terminal.

**Como usar:**
```bash
npm run create-admin
```
ou
```bash
node scripts/createAdminInteractive.js
```

**Prompts:**
- Nome completo
- Email
- Senha (mínimo 6 caracteres)

---

### 2. `createAdmin.js` (Rápido)
Cria um administrador com dados pré-configurados no código.

**Como usar:**
1. Edite o arquivo e configure os dados:
```javascript
const adminData = {
  nome: 'Seu Nome',
  email: 'seu@email.com',
  senha: 'suasenha123',
  role: 'admin'
};
```

2. Execute:
```bash
npm run create-admin-quick
```
ou
```bash
node scripts/createAdmin.js
```

---

### 3. `resetPassword.js`
Reseta a senha de qualquer usuário do sistema de forma interativa.

**Como usar:**
```bash
npm run reset-password
```
ou
```bash
node scripts/resetPassword.js
```

**O que faz:**
- Lista todos os usuários do sistema
- Solicita qual usuário resetar (por ID)
- Pede nova senha (mínimo 6 caracteres)
- Confirma a senha
- Atualiza com hash bcrypt

**Ideal para:**
- Usuários que esqueceram a senha
- Resetar senha de admin
- Manutenção de contas

---

### 4. `generatePasswordHash.js`
Gera um hash bcrypt para usar em updates SQL manuais.

**Como usar:**
1. Edite o arquivo e defina a senha desejada:
```javascript
const senha = 'minhaNovasenha123';
```

2. Execute:
```bash
npm run generate-hash
```
ou
```bash
node scripts/generatePasswordHash.js
```

**O que retorna:**
- Hash bcrypt da senha
- Comando SQL pronto para usar:
```sql
UPDATE Usuarios SET senha = '$2b$10$...' WHERE email = 'usuario@email.com';
```

**Útil para:**
- Updates diretos no banco de dados
- Scripts de migração
- Automação de criação de usuários

---

## ✅ Validações

Scripts de criação de admin validam:
- Email único (verifica se já existe)
- Formato de email válido
- Senha com mínimo 6 caracteres
- Nome com mínimo 3 caracteres
- Criptografia automática da senha com bcrypt

Scripts de senha validam:
- Usuário existe no banco
- Senha com mínimo 6 caracteres
- Confirmação de senha (em resetPassword.js)
- Hash bcrypt gerado corretamente

---

## 🔒 Segurança

- Senhas são automaticamente criptografadas com bcrypt (10 rounds)
- Emails são salvos em lowercase
- Validação de duplicidade antes da inserção (criação)
- Role 'admin' atribuída automaticamente (criação)
- Senhas nunca são exibidas em logs ou saídas
- Scripts requerem acesso direto ao servidor (não expõem APIs)

---

## 📝 Exemplo de Saída

```
========================================
  CRIAR NOVO USUÁRIO ADMINISTRADOR
========================================

Nome completo: Admin Sistema
Email: admin@sistema.com
Senha (mínimo 6 caracteres): ********

🔍 Verificando se o email já existe...
🔐 Criptografando senha...
💾 Criando usuário administrador...

✅ Usuário administrador criado com sucesso!

📋 Detalhes:
   ID: 1
   Nome: Admin Sistema
   Email: admin@sistema.com
   Role: admin

🔑 Use estas credenciais para fazer login no sistema
```

---

## 🚨 Erros Comuns

| Erro | Solução |
|------|---------|
| "Já existe um usuário com este email" | Use um email diferente |
| "Email inválido" | Certifique-se de incluir '@' no email |
| "Senha deve ter pelo menos 6 caracteres" | Use uma senha mais longa |
| "Erro de conexão" | Verifique se o banco está rodando e o .env está configurado |

---

## 📚 Documentação Completa
- [CRIAR_ADMIN.md](../CRIAR_ADMIN.md) - Como criar usuários admin
- [ALTERAR_SENHA.md](../ALTERAR_SENHA.md) - Como alterar senhas de usuários

---

## ⚡ Comandos Rápidos

```bash
npm run create-admin        # Criar admin (interativo)
npm run create-admin-quick  # Criar admin pré-configurado
npm run reset-password      # Resetar senha de usuário
npm run generate-hash       # Gerar hash bcrypt
```

Para mais detalhes, consulte: [CRIAR_ADMIN.md](../CRIAR_ADMIN.md)
