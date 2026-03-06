# 🎯 Como Criar um Orçamentista no Sistema

## 📌 Conceito Importante

**Todo orçamentista SEMPRE tem login no sistema!**

Diferentemente dos **Clientes** (que podem ou não ter usuário), os **Orçamentistas** sempre têm acesso ao sistema. Ao criar um orçamentista, automaticamente é criado:

1. ✅ **Usuário** com role 'orcamentista' (para login)
2. ✅ **Cadastro de Orçamentista** (dados profissionais)
3. ✅ **Vínculo automático** entre usuário e orçamentista

---

## 🚀 Método Recomendado: Interface Administrativa

### Passo a Passo

1. **Faça login** como administrador ou gerente

2. **Acesse** a página "Orçamentistas" no menu lateral

3. **Clique** em "Novo Orçamentista"

4. **Preencha o formulário:**
   ```
   📝 Nome Completo: João Silva
   📧 Email (login): joao.silva@empresa.com
   🎫 Matrícula: ORC001
   🔐 Senha: senha123 (mínimo 6 caracteres)
   🔐 Confirmar Senha: senha123
   ```

5. **Clique** em "Adicionar"

### ✅ Resultado

O sistema cria automaticamente:
- ✅ Usuário com email e senha para login
- ✅ Role definida como 'orcamentista'
- ✅ Cadastro completo na tabela Orcamentistas
- ✅ Vínculo entre usuário e orçamentista

### 👥 Próximo Passo: Vincular Clientes

1. Na lista de orçamentistas, clique no ícone de **olho 👁️**
2. Clique em **"Vincular Cliente"**
3. Selecione o cliente da lista
4. Confirme

Agora o orçamentista pode ver os dados desse cliente!

---

## 📋 Outras Formas de Criar Orçamentista

### Opção 2: Script Automatizado

Útil para desenvolvimento e testes:

```bash
cd backendSistemaOrcamentario
node scripts/createOrcamentista.js
```

O script perguntará:
- Nome
- Email
- Senha
- Matrícula

E criará tudo automaticamente.

---

### Opção 3: API Direta

Para integrações ou automações:

```http
POST http://localhost:3000/orcamentistas/orcamentista
Authorization: Bearer {token_de_admin}
Content-Type: application/json

{
  "nome": "Maria Santos",
  "email": "maria@empresa.com",
  "matricula": "ORC002",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "message": "Orçamentista e usuário cadastrados com sucesso!",
  "data": {
    "usuarioId": 15,
    "orcamentistaId": 2
  }
}
```

---

## 🔒 Segurança do Sistema

### ⚠️ Importante: NÃO há auto-cadastro público

Por questões de segurança, o sistema **NÃO permite** que qualquer pessoa crie uma conta de orçamentista. 

**Apenas administradores e gerentes** podem criar novos orçamentistas.

Isso garante:
- ✅ Controle total sobre quem acessa o sistema
- ✅ Prevenção de cadastros não autorizados
- ✅ Segurança dos dados de clientes e orçamentos
- ✅ Rastreabilidade de todas as contas criadas

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────┐
│ Admin cria orçamentista                 │
│ (nome, email, senha, matrícula)         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Sistema cria AUTOMATICAMENTE:           │
│ 1. Usuário (email + senha)              │
│ 2. Orçamentista (matrícula)             │
│ 3. Vínculo entre eles                   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Admin vincula clientes                  │
│ ao orçamentista                         │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Orçamentista faz login                  │
│ e vê apenas seus clientes               │
└─────────────────────────────────────────┘
```

---

## 🎓 Exemplo Prático

### Cenário: Criar orçamentista "Carlos Oliveira"

**1. Criar o Orçamentista**
- Nome: Carlos Oliveira
- Email: carlos@construtora.com
- Matrícula: ORC003
- Senha: carlos123

**2. Vincular Clientes**
- Cliente "Empresa ABC Ltda" ✅
- Cliente "João da Silva MEI" ✅

**3. Login do Orçamentista**
- Email: carlos@construtora.com
- Senha: carlos123

**4. Acesso do Orçamentista**
- ✅ Vê: Empresa ABC Ltda e João da Silva MEI
- ✅ Vê: Todos os projetos desses clientes
- ✅ Vê: Todos os orçamentos desses clientes
- ❌ NÃO vê: Outros clientes do sistema

---

## ⚠️ Diferenças: Orçamentista vs Cliente

| Aspecto | Orçamentista | Cliente |
|---------|--------------|---------|
| **Tem login?** | ✅ Sempre | ⚠️ Opcional |
| **Criação automática de usuário?** | ✅ Sim | ❌ Não |
| **Senha obrigatória?** | ✅ Sim | ❌ Não |
| **Acesso ao sistema?** | ✅ Sim (dashboard exclusivo) | ⚠️ Só se tiver usuário |
| **Vê outros registros?** | ❌ Só clientes vinculados | ❌ Só próprios dados |

---

## 🔐 Segurança

- ✅ Senha criptografada com bcrypt
- ✅ Validação de senha mínima (6 caracteres)
- ✅ Email único no sistema
- ✅ Matrícula única
- ✅ Transação de banco de dados (rollback em caso de erro)

Se a criação do usuário falhar, o orçamentista também não é criado (tudo ou nada).

---

## ❓ FAQ

**P: Posso criar um orçamentista sem senha?**
R: Não mais. A partir desta versão, todo orçamentista DEVE ter login.

**P: Posso editar a senha depois?**
R: Atualmente não pela interface de orçamentista. Use a interface de "Usuários" ou crie funcionalidade de reset de senha.

**P: O que acontece se eu deletar um orçamentista?**
R: O usuário associado permanece, mas o vínculo com clientes é removido.

**P: Posso usar o mesmo email para cliente e orçamentista?**
R: Não. Emails devem ser únicos no sistema.

**P: Como o orçamentista altera sua senha?**
R: Isso deve ser implementado em uma tela de "Meu Perfil" ou via admin.

---

## 🎉 Pronto!

Agora você pode criar orçamentistas facilmente pela interface administrativa, e eles automaticamente terão acesso ao sistema! 🚀
