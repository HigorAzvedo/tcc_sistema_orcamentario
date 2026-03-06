# Rotas do Sistema Orçamentário

Este documento lista todas as rotas configuradas no sistema usando React Router.

## Estrutura de Rotas

### Página Principal
- **/** - Dashboard (página inicial)

### Módulos do Sistema
- **/orcamentos** - Gestão de Orçamentos
- **/clientes** - Gestão de Clientes  
- **/produtos** - Gestão de Produtos
- **/fornecedores** - Gestão de Fornecedores
- **/materiais** - Gestão de Materiais
- **/maquinario** - Gestão de Maquinário
- **/orcamentistas** - Gestão de Orçamentistas
- **/projetos** - Gestão de Projetos
- **/areas** - Gestão de Áreas
- **/cargos** - Gestão de Cargos
- **/relatorios** - Relatórios do Sistema
- **/configuracoes** - Configurações do Sistema

## Estrutura de Arquivos

```
src/
├── pages/
│   ├── Dashboard.jsx
│   ├── Orcamentos.jsx
│   ├── Clientes.jsx
│   ├── Produtos.jsx
│   ├── Fornecedores.jsx
│   ├── Materiais.jsx
│   ├── Maquinario.jsx
│   ├── Orcamentistas.jsx
│   ├── Projetos.jsx
│   ├── Areas.jsx
│   ├── Cargos.jsx
│   ├── Relatorios.jsx
│   └── Configuracoes.jsx
├── components/
│   ├── Layout/
│   │   └── index.jsx
│   └── Aside/
│       ├── index.jsx
│       └── style.css
└── App.jsx
```

## Como Usar

1. O sistema usa React Router para navegação
2. O componente `Layout` envolve todas as páginas com o menu lateral
3. O menu lateral (`Aside`) usa componentes `Link` do React Router
4. Cada página está pronta para ser desenvolvida com seu conteúdo específico


