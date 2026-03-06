import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import { FaCalculator, FaClipboardList, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

function Dashboard() {
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    const handleCriarOrcamento = () => {
        if (isAuthenticated) {
            navigate('/orcamentos');
        } else {
            navigate('/login');
        }
    };

    return (
        <>
            <main className='containerDashboard'>

                <div className='containerApresentacao'>
                    <h1>Sistema de Gestão de Orçamentos</h1>
                    <p>O OrçaFácil é um sistema web de gestão de orçamentos projetado para ser moderno, minimalista e intuitivo. Ele permite a criação e gerenciamento de orçamentos, adicionando itens como materiais, mão de obra e maquinário, com cálculos automáticos.</p>

                    <button 
                        className='btn-novo-orcamento'
                        onClick={handleCriarOrcamento}
                    >
                        {isAuthenticated ? 'Criar Novo Orçamento' : 'Entrar para Criar Orçamento'}
                    </button>

                    <div className='indicadores'>
                        <span>Cliente</span>
                        <span>Materiais</span>
                        <span>Projetos</span>
                    </div>
                </div>

                <div className="containerRecursos">
                    <h1>Principais Recursos do OrçaFácil</h1>

                    <div className="cards">
                        <div className="card">
                            <FaCalculator className="card-icon" />
                            <h3>Cálculos Automáticos</h3>
                            <p>Adicione materiais, mão de obra e maquinário, e deixe o sistema calcular os custos totais automaticamente.</p>
                        </div>
                        <div className="card">
                            <FaClipboardList className="card-icon" />
                            <h3>Gestão Detalhada</h3>
                            <p>Mantenha o controle de todos os itens do seu orçamento com descrições, quantidades e valores unitários.</p>
                        </div>
                        <div className="card">
                            <FaUsers className="card-icon" />
                            <h3>Gestão de Clientes</h3>
                            <p>Cadastre e organize seus clientes, vinculando orçamentos e projetos de forma eficiente.</p>
                        </div>
                    </div>
                </div>


                <div className="containerProcesso">
                    <h1>Como funciona:</h1>
                    <div className="etapas">
                        <div className="etapa1">
                            <div className='numero'>
                                <span>1</span>
                            </div>
                            <div className='descricao'>
                                <h2>Cadastre um Novo Orçamento</h2>
                                <p>Inicie o processo preenchendo as informações básicas do seu projeto, como nome, cliente e datas.</p>
                            </div>
                        </div>
                        <div className="etapa1">
                            <div className='numero'>
                                <span>
                                    2
                                </span>
                            </div>
                            <div className='descricao'>
                                <h2>Adicione Itens Detalhados</h2>
                                <p>Inclua todos os componentes do seu orçamento, como materiais, serviços e equipamentos, com seus respectivos valores.</p>
                            </div>
                        </div>
                        <div className="etapa1">
                            <div className='numero'>
                                <span>
                                    3
                                </span>
                            </div>
                            <div className='descricao'>
                                <h2>Visualize o Resumo Final</h2>
                                <p>Obtenha uma visão completa do orçamento, incluindo subtotais, impostos e o valor total, antes de finalizar.</p>
                            </div>
                        </div>
                        <div className="etapa1">
                           <div className='numero'>
                                <span>
                                    4
                                </span>
                            </div>
                            <div className='descricao'>
                                <h2>Gere e Envie Documentos</h2>
                                <p>Salve seu orçamento, gere PDFs profissionais e envie diretamente para seus clientes de forma prática.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Dashboard;