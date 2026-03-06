# 📊 Sistema Orçamentário

## 📝 Descrição Geral

O **Sistema Orçamentário** é uma aplicação web completa desenvolvida para gerenciar e controlar orçamentos de projetos de forma eficiente e organizada. O sistema permite que empresas gerenciem todo o ciclo de vida de orçamentos, desde o cadastro de clientes até a composição detalhada de custos com materiais, mão de obra e maquinários.

Desenvolvido como um **monorepo**, o sistema integra backend e frontend em uma arquitetura moderna e escalável, ideal para empresas de construção civil, prestação de serviços, consultorias e qualquer negócio que necessite gerenciar orçamentos complexos.

## 🎯 Objetivo

Facilitar o processo de **criação, gestão e controle de orçamentos** através de uma plataforma centralizada que permite:

- **Cadastro completo de clientes e projetos**
- **Composição detalhada de orçamentos** com múltiplos tipos de itens
- **Gestão de recursos**: materiais, maquinários e mão de obra (cargos)
- **Controle de fornecedores** e suas ofertas
- **Categorização por áreas** de atuação
- **Controle de acesso** com diferentes níveis de permissão
- **Acompanhamento de status** dos orçamentos

## 🏢 Público-Alvo

- Empresas de construção civil
- Empresas de engenharia e arquitetura
- Prestadores de serviços técnicos
- Consultorias de projetos
- Qualquer organização que precise gerenciar orçamentos detalhados

## 💼 Principais Funcionalidades

### 👥 Gestão de Usuários e Autenticação
- Sistema de autenticação seguro com JWT
- Integração com Auth0 para login social
- Três níveis de permissão: **Admin**, **Manager** e **User**
- Controle de acesso baseado em roles (RBAC)
- Gestão de perfis de usuários

### 🤝 Gestão de Clientes
- Cadastro completo de clientes (PF ou PJ)
- Vinculação de clientes a usuários específicos
- Armazenamento de dados de contato e documentação (CPF/CNPJ)
- Histórico de projetos por cliente

### 📁 Gestão de Projetos
- Criação de projetos vinculados a clientes
- Definição de cronograma (data de início e fim)
- Descrição detalhada do escopo
- Múltiplos orçamentos por projeto

### 💰 Gestão de Orçamentos
- Criação de orçamentos nomeados
- Controle de status (Em elaboração, Aprovado, Rejeitado, etc.)
- Cálculo automático de valores totais
- Versionamento através de múltiplos orçamentos por projeto
- Data de criação e histórico de alterações

### 📦 Composição de Itens de Orçamento
- **Materiais**: Produtos e insumos com descrição e unidade de medida
- **Mão de Obra**: Cargos com salários definidos
- **Maquinários**: Equipamentos com valores de locação/operação
- Quantidade e valor unitário personalizados por item
- Cálculo automático de valor total por item

### 🏗️ Gestão de Áreas
- Categorização de recursos por área de atuação
- Organização de materiais por área (ex: Elétrica, Hidráulica, Estrutural)
- Organização de cargos por área (ex: Engenharia, Administrativo)

### 🚚 Gestão de Fornecedores
- Cadastro completo de fornecedores
- Vinculação de fornecedores a materiais (relação N:N)
- Vinculação de fornecedores a maquinários (relação N:N)
- Consulta rápida de quem fornece determinado recurso

### 👷 Gestão de Orçamentistas
- Cadastro de profissionais responsáveis pela elaboração de orçamentos
- Controle de matrícula e dados de contato

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Knex.js** - Query Builder SQL
- **JWT (JSON Web Tokens)** - Autenticação
- **Auth0** - Autenticação social
- **SQLite/PostgreSQL/MySQL** - Banco de dados (compatível)

### Frontend
- **React** - Biblioteca JavaScript para UI
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **CSS Modules/Styled Components** - Estilização

### Infraestrutura
- **Monorepo** - Arquitetura unificada
- **Concurrently** - Execução simultânea de processos
- **ESLint** - Linter para qualidade de código

## 📊 Modelo de Dados

O sistema possui **13 tabelas principais** organizadas em módulos:

### Módulo de Autenticação
- `Usuarios` - Usuários do sistema com roles e autenticação

### Módulo de Clientes e Projetos
- `Cliente` - Dados de clientes (PF/PJ)
- `Projetos` - Projetos vinculados a clientes

### Módulo de Orçamentos
- `Orcamentos` - Orçamentos vinculados a projetos
- `ItensOrcamento` - Composição detalhada dos orçamentos
- `Orcamentistas` - Profissionais que elaboram orçamentos

### Módulo de Recursos
- `Areas` - Categorias de recursos
- `Materiais` - Materiais e insumos
- `Cargos` - Funções e mão de obra
- `Maquinarios` - Equipamentos

### Módulo de Fornecedores
- `Fornecedor` - Dados de fornecedores
- `FornecedorMaterial` - Relação N:N entre fornecedores e materiais
- `FornecedorMaquinario` - Relação N:N entre fornecedores e maquinários

## 🔐 Segurança

- **Autenticação JWT** com tokens de acesso e refresh
- **Middleware de autorização** baseado em roles
- **Proteção de rotas** no frontend e backend
- **Validação de dados** em todas as operações
- **Senhas criptografadas** com hashing seguro
- **CORS configurado** para comunicação segura

## 📈 Diferenciais

✅ **Arquitetura Monorepo** - Facilita manutenção e deploy  
✅ **Múltiplos tipos de recursos** - Materiais, mão de obra e maquinários  
✅ **Categorização por áreas** - Organização lógica de recursos  
✅ **Gestão de fornecedores** - Controle completo da cadeia de suprimentos  
✅ **Controle de permissões** - Segurança em camadas  
✅ **Cálculos automáticos** - Valores totais calculados automaticamente  
✅ **Relacionamentos complexos** - Modelo de dados robusto e normalizado  
✅ **Cascata de deleções** - Integridade referencial garantida  

## 👥 Equipe de Desenvolvimento

**Desenvolvido por:** Higor Azevedo e Lucas

## 📄 Licença

ISC License

---

**Versão:** 1.0.0  
**Status:** Em Desenvolvimento Ativo
