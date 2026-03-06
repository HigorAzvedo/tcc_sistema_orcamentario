import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../service/api';
import './AddItems.css';

const AddItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orcamentoId = location.state?.orcamentoId;
  const orcamentoNome = location.state?.orcamentoNome;

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

  useEffect(() => {
    if (!orcamentoId) {
      toast.error('Orçamento não identificado. Retornando...');
      navigate('/orcamentos');
      return;
    }
    loadOptions();
    loadProjetosDoOrcamento(orcamentoId);
  }, [orcamentoId, navigate]);

  const loadOptions = async () => {
    try {
      const response = await api.get('/itensOrcamentos/itensOrcamento/options');
      if (response.data) {
        setMateriais(response.data.materiais || []);
        setCargos(response.data.cargos || []);
        setMaquinarios(response.data.maquinarios || []);
      }
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
      toast.error('Erro ao carregar opções dos formulários.');
    }
  };

  const loadProjetosDoOrcamento = async (orcamentoId) => {
    try {
      const response = await api.get(`/orcamentos/orcamentos/${orcamentoId}/projetos`);
      if (response.data) {
        setProjetos(response.data || []);

        if (response.data.length === 1) {
          setProjetoSelecionado(response.data[0].value.toString());
        }
      }
    } catch (error) {
      console.error('Erro ao carregar projetos do orçamento:', error);
      toast.error('Erro ao carregar projetos do orçamento.');
      setProjetos([]);
    }
  };

  const adicionarItem = () => {
    if (!projetoSelecionado) {
      toast.warning('Selecione um projeto!');
      return;
    }
    if (!materialSelecionado) {
      toast.warning('Selecione um material!');
      return;
    }
    if (!quantidade || parseFloat(quantidade) <= 0) {
      toast.warning('Quantidade deve ser maior que zero!');
      return;
    }
    if (!valorUnitario || parseFloat(valorUnitario) <= 0) {
      toast.warning('Valor unitário deve ser maior que zero!');
      return;
    }

    const materialEncontrado = materiais.find(m => m.value === parseInt(materialSelecionado));
    const cargoEncontrado = cargos.find(c => c.value === parseInt(cargoSelecionado));
    const maquinarioEncontrado = maquinarioSelecionado
      ? maquinarios.find(m => m.value === parseInt(maquinarioSelecionado))
      : null;

    const valorTotal = parseFloat(quantidade) * parseFloat(valorUnitario);

    const novoItem = {
      id: Date.now(),
      descricao,
      unidade,
      quantidade: parseFloat(quantidade),
      valorUnitario: parseFloat(valorUnitario),
      valorTotal,
      idProjeto: parseInt(projetoSelecionado),
      idOrcamento: orcamentoId,
      idMaterial: parseInt(materialSelecionado),
      idCargo: parseInt(cargoSelecionado),
      idMaquinario: maquinarioSelecionado ? parseInt(maquinarioSelecionado) : null,
      materialNome: materialEncontrado?.label || '',
      cargoNome: cargoEncontrado?.label || '',
      maquinarioNome: maquinarioEncontrado?.label || 'N/A'
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
            >
              <option value="">Selecione um projeto</option>
              {projetos.map(projeto => (
                <option key={projeto.value} value={projeto.value}>{projeto.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Material</label>
            <select
              value={materialSelecionado}
              onChange={(e) => setMaterialSelecionado(e.target.value)}
              className="form-input"
            >
              <option value="">Selecione um material</option>
              {materiais.map(material => (
                <option key={material.value} value={material.value}>{material.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Cargo (Opcional)</label>
            <select
              value={cargoSelecionado}
              onChange={(e) => setCargoSelecionado(e.target.value)}
              className="form-input"
            >
              <option value="">Selecione um cargo</option>
              {cargos.map(cargo => (
                <option key={cargo.value} value={cargo.value}>{cargo.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Maquinário (Opcional)</label>
            <select
              value={maquinarioSelecionado}
              onChange={(e) => setMaquinarioSelecionado(e.target.value)}
              className="form-input"
            >
              <option value="">Nenhum</option>
              {maquinarios.map(maquinario => (
                <option key={maquinario.value} value={maquinario.value}>{maquinario.label}</option>
              ))}
            </select>
          </div>
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
            <label>Quantidade</label>
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
        <table className="tabela-itens">
          <thead>
            <tr>
              <th>Material</th>
              <th>Descrição</th>
              <th>Cargo</th>
              <th>Maquinário</th>
              <th>Qtd.</th>
              <th>Valor Unit.</th>
              <th>Valor Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {itensAdicionados.length === 0 ? (
              <tr>
                <td colSpan="8" className="texto-vazio">Nenhum item adicionado ainda.</td>
              </tr>
            ) : (
              itensAdicionados.map(item => (
                <tr key={item.id}>
                  <td>{item.materialNome}</td>
                  <td>{item.descricao.length > 0 ? item.descricao : 'N/A'}</td>
                  <td>{item.cargoNome}</td>
                  <td>{item.maquinarioNome}</td>
                  <td>{item.quantidade.toFixed(2)}</td>
                  <td>R$ {item.valorUnitario.toFixed(2)}</td>
                  <td>R$ {item.valorTotal.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => removerItem(item.id)}
                      className="btn-remover"
                      title="Remover item"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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