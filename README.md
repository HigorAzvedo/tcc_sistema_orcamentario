# Sistema Orçamentário - Monorepo

Este é um monorepo que contém o backend (Express.js) e o frontend (React + Vite) do Sistema Orçamentário.

## 📖 Sobre o Sistema

O **Sistema Orçamentário** é uma aplicação web completa para gerenciamento e controle de orçamentos de projetos. Permite cadastro de clientes, criação de projetos, elaboração de orçamentos detalhados com materiais, mão de obra e maquinários, gestão de fornecedores e controle de permissões.

**Ideal para:** Empresas de construção civil, engenharia, consultorias e prestadores de serviços.

📄 **Documentação completa:** [SOBRE_O_SISTEMA.md](SOBRE_O_SISTEMA.md)  
📋 **Resumo executivo:** [RESUMO_SISTEMA.md](RESUMO_SISTEMA.md)  
🗂️ **Diagrama do banco de dados:** [backendSistemaOrcamentario/DATABASE_DIAGRAM.md](backendSistemaOrcamentario/DATABASE_DIAGRAM.md)

## Estrutura do Projeto

```
sistema_orcamentario_monorepo/
├── backendSistemaOrcamentario/     # API Backend (Node.js + Express)
├── frontendSistemaOrcamentario/    # Frontend (React + Vite)
│   └── sistemaOrcamentario/
└── package.json                     # Configuração do monorepo
```

## Instalação

### Instalar todas as dependências (Backend + Frontend + Monorepo)

```bash
npm run install:all
```

### Instalar dependências separadamente

```bash
# Apenas backend
npm run install:backend

# Apenas frontend
npm run install:frontend
```

## Executar o Projeto

### Executar Backend e Frontend simultaneamente

```bash
npm run dev
```

Este comando irá:
- Iniciar o backend na porta 3000 (ou a porta definida no .env)
- Iniciar o frontend na porta 5173 (Vite)

### Executar apenas o Backend

```bash
npm run dev:backend
```

### Executar apenas o Frontend

```bash
npm run dev:frontend
```

## Configuração

### Backend
- O backend utiliza variáveis de ambiente definidas em um arquivo `.env`
- Certifique-se de configurar o arquivo `.env` em `backendSistemaOrcamentario/`

### Frontend
- O frontend está configurado para rodar com Vite
- Configurações podem ser ajustadas em `frontendSistemaOrcamentario/sistemaOrcamentario/vite.config.js`

## Desenvolvimento

Para desenvolvimento, utilize `npm run dev` na raiz do projeto. Isso iniciará ambos os projetos simultaneamente com recarregamento automático quando houver alterações no código.
