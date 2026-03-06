import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orcamentos from './pages/Orcamentos'
import Clientes from './pages/Clientes'
import Produtos from './pages/Produtos'
import Fornecedores from './pages/Fornecedores'
import Materiais from './pages/Materiais'
import Maquinario from './pages/Maquinario'
import Orcamentistas from './pages/Orcamentistas'
import OrcamentistaDetalhes from './pages/OrcamentistaDetalhes'
import DashboardOrcamentista from './pages/DashboardOrcamentista'
import Projetos from './pages/Projetos'
import Areas from './pages/Areas'
import Cargos from './pages/Cargos'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import ItensOrcamentos from './pages/ItensOrcamentos';
import ViewItems from './pages/ViewItems';
import AddItems from './pages/AddItems/AddItems';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Rotas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orcamentos"
          element={
            <ProtectedRoute>
              <Layout>
                <Orcamentos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/itens-orcamentos"
          element={
            <ProtectedRoute>
              <Layout>
                <ItensOrcamentos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/adicionar-itens-orcamentos"
          element={
            <ProtectedRoute>
              <Layout>
                <AddItems />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ver-itens-orcamentos"
          element={
            <ProtectedRoute>
              <Layout>
                <ViewItems />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Layout>
                <Clientes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/produtos"
          element={
            <ProtectedRoute>
              <Layout>
                <Produtos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fornecedores"
          element={
            <ProtectedRoute>
              <Layout>
                <Fornecedores />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/materiais"
          element={
            <ProtectedRoute>
              <Layout>
                <Materiais />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maquinario"
          element={
            <ProtectedRoute>
              <Layout>
                <Maquinario />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orcamentistas"
          element={
            <ProtectedRoute>
              <Layout>
                <Orcamentistas />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orcamentistas/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <OrcamentistaDetalhes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-orcamentista"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardOrcamentista />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projetos"
          element={
            <ProtectedRoute>
              <Layout>
                <Projetos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/areas"
          element={
            <ProtectedRoute>
              <Layout>
                <Areas />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cargos"
          element={
            <ProtectedRoute>
              <Layout>
                <Cargos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/relatorios"
          element={
            <ProtectedRoute>
              <Layout>
                <Relatorios />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute>
              <Layout>
                <Configuracoes />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Redirecionamento para login se rota não encontrada */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer position='bottom-right'/>
    </Router>
  )
}

export default App
