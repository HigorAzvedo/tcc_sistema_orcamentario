# 📊 Sistema Orçamentário - Visão Resumida

## O que é?

O **Sistema Orçamentário** é uma aplicação web moderna para gerenciamento completo de orçamentos de projetos, permitindo controle detalhado de custos com materiais, mão de obra e maquinários.

## Para quem?

Ideal para empresas de construção civil, engenharia, consultorias e prestadores de serviços que precisam criar e gerenciar orçamentos complexos.

## Principais Recursos

🎯 **Gestão Completa**
- Cadastro de clientes (PF/PJ)
- Gerenciamento de projetos
- Criação de orçamentos detalhados
- Controle de status e versões

💼 **Recursos e Insumos**
- Materiais com unidades de medida
- Mão de obra (cargos com salários)
- Maquinários e equipamentos
- Categorização por áreas

🤝 **Fornecedores**
- Cadastro de fornecedores
- Vinculação com materiais e maquinários
- Controle da cadeia de suprimentos

🔐 **Segurança**
- Autenticação JWT + Auth0
- 3 níveis de acesso: Admin, Manager, User
- Controle de permissões por funcionalidade

📊 **Cálculos Automáticos**
- Valores unitários × quantidade
- Total por item
- Total do orçamento
- Composição detalhada de custos

## Tecnologias

**Backend:** Node.js, Express, Knex, JWT  
**Frontend:** React, Vite  
**Arquitetura:** Monorepo  
**Banco de Dados:** SQL (Knex - compatível com SQLite, PostgreSQL, MySQL)

## Estrutura

- **13 tabelas** organizadas em módulos
- **Relacionamentos complexos** entre entidades
- **Integridade referencial** com cascatas
- **Modelo normalizado** e escalável

## Como Usar

```bash
# Instalar dependências do monorepo
npm run install:all

# Executar backend + frontend simultaneamente
npm run dev

# Executar separadamente
npm run dev:backend  # Porta 3000
npm run dev:frontend # Porta 5173
```

## Diferenciais

✅ Interface intuitiva e moderna  
✅ Composição flexível de orçamentos  
✅ Múltiplos orçamentos por projeto  
✅ Gestão de fornecedores integrada  
✅ Categorização por áreas de atuação  
✅ Sistema de permissões robusto  
✅ Cálculos automáticos e precisos  

---

**Desenvolvido por:** Higor Azevedo e Lucas  
**Versão:** 1.0.0
