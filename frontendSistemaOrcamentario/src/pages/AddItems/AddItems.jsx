import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../service/api';
import Table from '../../components/Table';
import FilterableSelect from '../../components/FilterableSelect';
import './AddItems.css';

const itemTabs = [
  { key: 'material', label: 'Material' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'maquinario', label: 'Maquinário' }
];

const AddItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orcamentoId = location.state?.orcamentoId;
  const orcamentoNome = location.state?.orcamentoNome;
  const projetoIdFromNav = location.state?.projetoId;

  const [descricao, setDescricao] = useState('');
  const [unidade, setUnidade] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [itensAdicionados, setItensAdicionados] = useState([]);

  const [projetos, setProjetos] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [maquinarios, setMaquinarios] = useState([]);

  const [projetoSelecionado, setProjetoSelecionado] = useState('');
  const [materialSelecionado, setMaterialSelecionado] = useState('');
  const [cargoSelecionado, setCargoSelecionado] = useState('');
  const [maquinarioSelecionado, setMaquinarioSelecionado] = useState('');
  const [activeTab, setActiveTab] = useState('material');

  const loadOptions = useCallback(async () => {
    try {
      const response = await api.get('/itensOrcamentos/itensOrcamento/options');
      if (response.data) {
        console.log(response.data, 'options response');
        setMateriais(response.data.materiais || []);
        setCargos(response.data.cargos || []);
        setMaquinarios(response.data.maquinarios || []);
      }
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
      toast.error('Erro ao carregar opções dos formulários.');
    }
  }, []);

  const loadProjetosDoOrcamento = useCallback(async (orcamentoId) => {
    try {
      const response = await api.get(`/orcamentos/orcamentos/${orcamentoId}/projetos`);
      if (response.data) {
        setProjetos(response.data || []);

        if (response.data.length === 1) {
          setProjetoSelecionado(response.data[0].value.toString());
        } else if (response.data.length === 0 && projetoIdFromNav) {
          const projetoResponse = await api.get(`/orcamentos/orcamentos/projetos`);
          const projetoIdNumero = parseInt(projetoIdFromNav, 10);
          const projetoEncontrado = (projetoResponse.data || []).find(p => p.value === projetoIdNumero);
          if (projetoEncontrado) {
            setProjetos([projetoEncontrado]);
            setProjetoSelecionado(projetoEncontrado.value.toString());
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar projetos do orçamento:', error);
      toast.error('Erro ao carregar projetos do orçamento.');
      setProjetos([]);
    }
  }, [projetoIdFromNav]);

  useEffect(() => {
    if (!orcamentoId) {
      toast.error('Orçamento não identificado. Retornando...');
      navigate('/orcamentos');
      return;
    }

    loadOptions();
    loadProjetosDoOrcamento(orcamentoId);
  }, [loadOptions, loadProjetosDoOrcamento, navigate, orcamentoId]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setMaterialSelecionado('');
    setCargoSelecionado('');
    setMaquinarioSelecionado('');
  };

  const adicionarItem = () => {
    if (!projetoSelecionado) {
      toast.warning('Selecione um projeto!');
      return;
    }

    let itemId = null;
    let itemNome = '';
    let tipoItemLabel = '';

    if (activeTab === 'material') {
      if (!materialSelecionado) {
        toast.warning('Selecione um material!');
        return;
      }
      const materialEncontrado = materiais.find(m => m.value === parseInt(materialSelecionado, 10));
      itemId = parseInt(materialSelecionado, 10);
      itemNome = materialEncontrado?.label || '';
      tipoItemLabel = 'Material';
    }

    if (activeTab === 'cargo') {
      if (!cargoSelecionado) {
        toast.warning('Selecione um cargo!');
        return;
      }
      const cargoEncontrado = cargos.find(c => c.value === parseInt(cargoSelecionado, 10));
      itemId = parseInt(cargoSelecionado, 10);
      itemNome = cargoEncontrado?.label || '';
      tipoItemLabel = 'Cargo';
    }

    if (activeTab === 'maquinario') {
      if (!maquinarioSelecionado) {
        toast.warning('Selecione um maquinário!');
        return;
      }
      const maquinarioEncontrado = maquinarios.find(m => m.value === parseInt(maquinarioSelecionado, 10));
      itemId = parseInt(maquinarioSelecionado, 10);
      itemNome = maquinarioEncontrado?.label || '';
      tipoItemLabel = 'Maquinário';
    }

    if (!quantidade || parseFloat(quantidade) <= 0) {
      toast.warning('Quantidade deve ser maior que zero!');
      return;
    }
    if (!valorUnitario || parseFloat(valorUnitario) <= 0) {
      toast.warning('Valor unitário deve ser maior que zero!');
      return;
    }

    const valorTotal = parseFloat(quantidade) * parseFloat(valorUnitario);

    const novoItem = {
      id: Date.now(),
      descricao,
      unidade,
      quantidade: parseFloat(quantidade),
      valorUnitario: parseFloat(valorUnitario),
      valorTotal,
      tipoItem: activeTab,
      tipoItemLabel,
      itemNome,
      idProjeto: parseInt(projetoSelecionado, 10),
      idOrcamento: parseInt(orcamentoId, 10),
      idMaterial: activeTab === 'material' ? itemId : null,
      idCargo: activeTab === 'cargo' ? itemId : null,
      idMaquinario: activeTab === 'maquinario' ? itemId : null
    };

    setItensAdicionados([...itensAdicionados, novoItem]);

    setDescricao('');
    setUnidade('');
    setQuantidade('');
    setValorUnitario('');
    setMaterialSelecionado('');
    setCargoSelecionado('');
    setMaquinarioSelecionado('');

    toast.success('Item adicionado à lista!');
  };

  const removerItem = (id) => {
    setItensAdicionados(itensAdicionados.filter(item => item.id !== id));
    toast.info('Item removido da lista!');
  };

  const calcularSubtotal = () => {
    return itensAdicionados.reduce((total, item) => total + item.valorTotal, 0);
  };

  const salvarItens = async () => {
    if (itensAdicionados.length === 0) {
      toast.warning('Adicione pelo menos um item antes de salvar!');
      return;
    }

    try {
      const promises = itensAdicionados.map(item => {
        const dados = {
          valorUnitario: item.valorUnitario,
          quantidade: item.quantidade,
          idProjeto: item.idProjeto,
          idOrcamento: item.idOrcamento,
          idMaterial: item.idMaterial,
          idCargo: item.idCargo,
          idMaquinario: item.idMaquinario
        };

        return api.post('/itensOrcamentos/itensOrcamento', dados);
      });

      await Promise.all(promises);

      toast.success(`${itensAdicionados.length} itens salvos com sucesso!`);
      setTimeout(() => {
        navigate('/orcamentos');
      }, 1500);

    } catch (error) {
      console.error('Erro ao salvar itens:', error);
      toast.error('Erro ao salvar itens. Tente novamente.');
    }
  };

  const columns = [
    { header: 'Tipo', accessor: 'tipoItemLabel' },
    { header: 'Item', accessor: 'itemNome', render: (value) => value || 'N/A' },
    { header: 'Descrição', accessor: 'descricao', render: (value) => value.length > 0 ? value : 'N/A' },
    { header: 'Qtd.', accessor: 'quantidade', render: (value) => value.toFixed(2) },
    { header: 'Valor Unit.', accessor: 'valorUnitario', render: (value) => `R$ ${value.toFixed(2)}` },
    { header: 'Valor Total', accessor: 'valorTotal', render: (value) => `R$ ${value.toFixed(2)}` },
    {
      header: 'Ações',
      accessor: 'id',
      render: (id) => (
        <button
          onClick={() => removerItem(id)}
          className="btn-remover"
          title="Remover item"
        >
          <FaTrash />
        </button>
      ),
    },
  ];

  return (
    <div className="add-items-container">
      <div className="add-items-header">
        <h2>Adicionar Itens ao Orçamento: <span className="orcamento-nome">{orcamentoNome || 'Selecione um Orçamento'}</span></h2>
      </div>

      <div className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label>Projeto</label>
            <select
              value={projetoSelecionado}
              onChange={(e) => setProjetoSelecionado(e.target.value)}
              className="form-input"
              disabled
            >
              <option value="">Selecione um projeto</option>
              {projetos.map(projeto => (
                <option key={projeto.value} value={projeto.value}>{projeto.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="item-tabs">
          {itemTabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="form-row">
          {activeTab === 'material' && (
            <div className="form-group full-width">
              <label>Material</label>
              <FilterableSelect
                value={materialSelecionado}
                onChange={setMaterialSelecionado}
                options={materiais}
                placeholder="Selecione um material"
                searchPlaceholder="Buscar material..."
                emptyMessage="Nenhum material encontrado."
              />
            </div>
          )}

          {activeTab === 'cargo' && (
            <div className="form-group full-width">
              <label>Cargo</label>
              <FilterableSelect
                value={cargoSelecionado}
                onChange={setCargoSelecionado}
                options={cargos}
                placeholder="Selecione um cargo"
                searchPlaceholder="Buscar cargo..."
                emptyMessage="Nenhum cargo encontrado."
              />
            </div>
          )}

          {activeTab === 'maquinario' && (
            <div className="form-group full-width">
              <label>Maquinário</label>
              <FilterableSelect
                value={maquinarioSelecionado}
                onChange={setMaquinarioSelecionado}
                options={maquinarios}
                placeholder="Selecione um maquinário"
                searchPlaceholder="Buscar maquinário..."
                emptyMessage="Nenhum maquinário encontrado."
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Descrição (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Cimento CP-II 50kg"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          {/* <div className="form-group">
            <label>Unidade</label>
            <input
              type="text"
              placeholder="Ex: Saco, Hora, Dia"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="form-input"
            />
          </div> */}

          <div className="form-group">
            <label>Quantidade </label>
            <input
              type="number"
              placeholder="0"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="form-input"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Valor Unitário (R$)</label>
            <input
              type="number"
              placeholder="0,00"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(e.target.value)}
              className="form-input"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row button-right">
          <button onClick={adicionarItem} className="btn-adicionar-item">
            Adicionar Item
          </button>
        </div>

      </div>

      <div className="tabela-container">
        <Table 
          columns={columns} 
          data={itensAdicionados}
          searchable={false}
          emptyMessage="Nenhum item adicionado ainda."
        />
      </div>

      <div className="footer-container">
        <div className="subtotal">
          <strong>Subtotal: R$ {calcularSubtotal().toFixed(2)}</strong>
        </div>
        <div className="footer-buttons">
          <button onClick={() => navigate('/orcamentos')} className="btn-voltar">
            Voltar
          </button>
          <button onClick={salvarItens} className="btn-salvar">
            Salvar Itens
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItems;