import React, { useEffect, useState, useCallback, useContext } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../service/api';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import Table from '../components/Table';
import FilterableSelect from '../components/FilterableSelect';
import { AuthContext } from '../context/AuthContext';
import {
  FaChartBar,
  FaChartPie,
  FaFileInvoiceDollar,
  FaProjectDiagram,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSync,
  FaUsers,
  FaBoxes,
  FaTools,
  FaTruck,
  FaTimes,
} from 'react-icons/fa';
import './Relatorios.css';
import { formatDate } from '../utils/formatters';

/* ─────────────────────────────────────────────── */
const STATUS_CONFIG = {
  Aprovado: { icon: <FaCheckCircle />, bg: '#d4edda', color: '#155724', echarts: '#28a745' },
  Pendente: { icon: <FaClock />, bg: '#fff3cd', color: '#856404', echarts: '#ffc107' },
  Rejeitado: { icon: <FaTimesCircle />, bg: '#f8d7da', color: '#721c24', echarts: '#dc3545' },
  'Em Revisão': { icon: <FaSync />, bg: '#d1ecf1', color: '#0c5460', echarts: '#17a2b8' },
};

const PALETTE = ['#667eea', '#764ba2', '#28a745', '#fd7e14', '#17a2b8', '#dc3545', '#ffc107', '#6f42c1'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const formatCurrencyShort = (value) => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}k`;
  return formatCurrency(value);
};

/* ─── Mini progress bar ─── */
const ProgressBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="relatorio-progress-track">
      <div className="relatorio-progress-bar" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};

/* ─────────────────────────────────────────────── */
const Relatorios = () => {
  const { user } = useContext(AuthContext);
  const isOrcamentista = user?.role === 'orcamentista';

  const [loading, setLoading] = useState(true);
  const [orcamentos, setOrcamentos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [materiais, setMateriais] = useState([]);
  const [maquinarios, setMaquinarios] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      if (isOrcamentista) {
        // Orçamentista: carrega apenas dados dos seus clientes vinculados
        const [orcRes, projRes, cliRes] = await Promise.allSettled([
          api.get('/orcamentistas/meus-orcamentos'),
          api.get('/orcamentistas/meus-projetos'),
          api.get('/orcamentistas/meus-clientes'),
        ]);
        if (orcRes.status === 'fulfilled') setOrcamentos(orcRes.value.data || []);
        if (projRes.status === 'fulfilled') setProjetos(projRes.value.data || []);
        if (cliRes.status === 'fulfilled') {
          // meus-clientes retorna [{value, label}], normalizar para [{id, nome}]
          const raw = cliRes.value.data || [];
          setClientes(raw.map((c) => ({ id: c.value, nome: c.label })));
        }
      } else {
        // Admin / outros: carrega tudo
        const [orcRes, projRes, cliRes, matRes, maqRes, fornRes] = await Promise.allSettled([
          api.get('/orcamentos'),
          api.get('/projetos'),
          api.get('/clientes'),
          api.get('/materiais'),
          api.get('/maquinario'),
          api.get('/fornecedores'),
        ]);
        if (orcRes.status === 'fulfilled') setOrcamentos(orcRes.value.data || []);
        if (projRes.status === 'fulfilled') setProjetos(projRes.value.data || []);
        if (cliRes.status === 'fulfilled') setClientes(cliRes.value.data || []);
        if (matRes.status === 'fulfilled') setMateriais(matRes.value.data || []);
        if (maqRes.status === 'fulfilled') setMaquinarios(maqRes.value.data || []);
        if (fornRes.status === 'fulfilled') setFornecedores(fornRes.value.data || []);
      }
    } catch {
      toast.error('Erro ao carregar dados para relatórios.');
    } finally {
      setLoading(false);
    }
  }, [isOrcamentista]);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ─── Cálculos derivados ─── */
  const totalOrcamentos = orcamentos.length;
  const valorTotal = orcamentos.reduce((s, o) => s + parseFloat(o.valorTotalItens || 0), 0);
  const valorMedio = totalOrcamentos > 0 ? valorTotal / totalOrcamentos : 0;

  const statusCount = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = orcamentos.filter((o) => o.status === s).length;
    return acc;
  }, {});
  const maxStatus = Math.max(...Object.values(statusCount), 1);

  const valorPorStatus = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = orcamentos
      .filter((o) => o.status === s)
      .reduce((sum, o) => sum + parseFloat(o.valorTotalItens || 0), 0);
    return acc;
  }, {});

  /* Top projetos */
  const projetoValores = projetos
    .map((p) => ({
      ...p,
      totalOrc: orcamentos.filter((o) => o.projetoId === p.id).reduce((s, o) => s + parseFloat(o.valorTotalItens || 0), 0),
      qtdOrc: orcamentos.filter((o) => o.projetoId === p.id).length,
    }))
    .sort((a, b) => b.totalOrc - a.totalOrc)
    .slice(0, 8);

  /* Evolução mensal de orçamentos */
  const evolucaoMensal = (() => {
    const map = {};
    orcamentos.forEach((o) => {
      if (!o.dataCriacao) return;
      const d = new Date(o.dataCriacao);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { count: 0, valor: 0 };
      map[key].count += 1;
      map[key].valor += parseFloat(o.valorTotalItens || 0);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12); // últimos 12 meses
  })();

  /* Filtros na tabela */
  const orcamentosFiltrados = orcamentos.filter((o) => {
    const matchStatus = !filtroStatus || o.status === filtroStatus;
    const matchProjeto = !filtroProjeto || String(o.projetoId) === filtroProjeto;
    return matchStatus && matchProjeto;
  });

  const hasActiveFilter = filtroStatus || filtroProjeto;
  const clearFilters = () => { setFiltroStatus(''); setFiltroProjeto(''); };

  /* ─── Opções ECharts ─── */

  // 1. Rosca — distribuição de status
  const pieStatusOption = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}: <b>${p.value}</b> (${p.percent}%)`,
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemGap: 10,
      textStyle: { fontSize: 12, color: '#555' },
    },
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['38%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
      },
      data: Object.entries(STATUS_CONFIG).map(([name, cfg]) => ({
        name,
        value: statusCount[name] || 0,
        itemStyle: { color: cfg.echarts },
      })),
    }],
  };

  // 2. Barras horizontais — top projetos por valor
  const barProjetosOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0];
        return `${p.name}<br/><b>${formatCurrency(p.value)}</b>`;
      },
    },
    grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => formatCurrencyShort(v), fontSize: 11, color: '#888' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'category',
      data: projetoValores.map((p) => p.nome).reverse(),
      axisLabel: {
        fontSize: 12, color: '#555',
        formatter: (v) => v.length > 20 ? v.slice(0, 18) + '…' : v,
      },
    },
    series: [{
      type: 'bar',
      barMaxWidth: 32,
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: (params) => {
          const grad = {
            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' },
            ],
          };
          return grad;
        },
      },
      label: {
        show: true,
        position: 'right',
        formatter: (p) => formatCurrencyShort(p.value),
        fontSize: 11, color: '#555',
      },
      data: projetoValores.map((p) => p.totalOrc).reverse(),
    }],
  };

  // 3. Linha dupla — evolução mensal (qtd + valor)
  const lineEvolucaoOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const [p1, p2] = params;
        return `<b>${p1.name}</b><br/>
          ${p1.marker} Orçamentos: <b>${p1.value}</b><br/>
          ${p2.marker} Valor: <b>${formatCurrencyShort(p2.value)}</b>`;
      },
    },
    legend: {
      data: ['Orçamentos', 'Valor Total'],
      bottom: 0,
      textStyle: { fontSize: 12, color: '#555' },
    },
    grid: { left: '3%', right: '6%', bottom: '14%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: evolucaoMensal.map(([k]) => {
        const [y, m] = k.split('-');
        return `${m}/${y.slice(2)}`;
      }),
      axisLabel: { fontSize: 11, color: '#888' },
      axisLine: { lineStyle: { color: '#e0e0e0' } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Qtd',
        nameTextStyle: { fontSize: 11, color: '#888' },
        axisLabel: { fontSize: 11, color: '#888' },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      {
        type: 'value',
        name: 'Valor',
        nameTextStyle: { fontSize: 11, color: '#888' },
        axisLabel: { formatter: (v) => formatCurrencyShort(v), fontSize: 11, color: '#888' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Orçamentos',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: '#667eea' },
        itemStyle: { color: '#667eea', borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102,126,234,0.25)' },
              { offset: 1, color: 'rgba(102,126,234,0.02)' },
            ],
          },
        },
        data: evolucaoMensal.map(([, v]) => v.count),
      },
      {
        name: 'Valor Total',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 3, color: '#764ba2' },
        itemStyle: { color: '#764ba2', borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(118,75,162,0.2)' },
              { offset: 1, color: 'rgba(118,75,162,0.02)' },
            ],
          },
        },
        data: evolucaoMensal.map(([, v]) => v.valor),
      },
    ],
  };

  // 4. Barras agrupadas — valor por status
  const barStatusValorOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        return params.map((p) => `${p.marker} ${p.name}: <b>${formatCurrency(p.value)}</b>`).join('<br/>');
      },
    },
    grid: { left: '3%', right: '5%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: Object.keys(STATUS_CONFIG),
      axisLabel: { fontSize: 12, color: '#555' },
      axisLine: { lineStyle: { color: '#e0e0e0' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => formatCurrencyShort(v), fontSize: 11, color: '#888' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'bar',
      barMaxWidth: 60,
      itemStyle: { borderRadius: [6, 6, 0, 0] },
      data: Object.entries(STATUS_CONFIG).map(([s, cfg]) => ({
        value: valorPorStatus[s] || 0,
        itemStyle: { color: cfg.echarts },
        name: s,
      })),
      label: {
        show: true, position: 'top',
        formatter: (p) => formatCurrencyShort(p.value),
        fontSize: 11, color: '#555',
      },
    }],
  };

  if (loading) return <Loading />;

  return (
    <div className="relatorios-page">

      {/* ─── Cabeçalho ─── */}
      <div className="relatorios-header">
        <div className="relatorios-header-text">
          <h1><FaChartBar className="header-icon" /> Relatórios</h1>
          <p>
            {isOrcamentista
              ? 'Visão geral dos orçamentos e projetos dos seus clientes'
              : 'Visão geral e análise do sistema orçamentário'}
          </p>
        </div>
        <button className="btn-refresh" onClick={loadAll} title="Atualizar dados">
          <FaSync /> Atualizar
        </button>
      </div>

      {/* ─── Cards de resumo ─── */}
      <div className="relatorios-stats">
        {[
          { label: 'Orçamentos', value: totalOrcamentos, icon: <FaFileInvoiceDollar />, cls: 'accent-blue', show: true },
          { label: 'Projetos', value: projetos.length, icon: <FaProjectDiagram />, cls: 'accent-purple', show: true },
          { label: 'Clientes', value: clientes.length, icon: <FaUsers />, cls: 'accent-green', show: true },
          { label: 'Materiais', value: materiais.length, icon: <FaBoxes />, cls: 'accent-orange', show: !isOrcamentista },
          { label: 'Equipamentos', value: maquinarios.length, icon: <FaTools />, cls: 'accent-teal', show: !isOrcamentista },
          { label: 'Fornecedores', value: fornecedores.length, icon: <FaTruck />, cls: 'accent-red', show: !isOrcamentista },
        ].filter(({ show }) => show).map(({ label, value, icon, cls }) => (
          <div key={label} className={`rel-stat-card ${cls}`}>
            <div className="rel-stat-icon">{icon}</div>
            <div className="rel-stat-info">
              <span className="rel-stat-value">{value}</span>
              <span className="rel-stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Cards financeiros ─── */}
      <div className="relatorios-financeiro">
        <div className="financeiro-card principal">
          <p className="fin-label">Valor Total em Orçamentos</p>
          <p className="fin-value">{formatCurrency(valorTotal)}</p>
        </div>
        <div className="financeiro-card">
          <p className="fin-label">Ticket Médio por Orçamento</p>
          <p className="fin-value secondary">{formatCurrency(valorMedio)}</p>
        </div>
        <div className="financeiro-card">
          <p className="fin-label">Valor Aprovado</p>
          <p className="fin-value green">{formatCurrency(valorPorStatus['Aprovado'])}</p>
        </div>
        <div className="financeiro-card">
          <p className="fin-label">Valor Pendente</p>
          <p className="fin-value yellow">{formatCurrency(valorPorStatus['Pendente'])}</p>
        </div>
      </div>

      {/* ─── Linha 1: Rosca Status + Barras Status Valor ─── */}
      <div className="relatorios-charts-row">
        <div className="rel-panel chart-panel">
          <h2><FaChartPie /> Distribuição por Status</h2>
          {totalOrcamentos === 0 ? (
            <div className="rel-empty">Nenhum orçamento para exibir.</div>
          ) : (
            <ReactECharts
              option={pieStatusOption}
              style={{ height: 280 }}
              notMerge
              lazyUpdate
            />
          )}
        </div>

        <div className="rel-panel chart-panel">
          <h2><FaChartBar /> Valor por Status</h2>
          {totalOrcamentos === 0 ? (
            <div className="rel-empty">Nenhum orçamento para exibir.</div>
          ) : (
            <ReactECharts
              option={barStatusValorOption}
              style={{ height: 280 }}
              notMerge
              lazyUpdate
            />
          )}
        </div>
      </div>

      {/* ─── Linha 2: Evolução Mensal ─── */}
      <div className="rel-panel chart-panel chart-full">
        <h2><FaChartBar /> Evolução Mensal de Orçamentos</h2>
        {evolucaoMensal.length === 0 ? (
          <div className="rel-empty">Sem dados de evolução mensal.</div>
        ) : (
          <ReactECharts
            option={lineEvolucaoOption}
            style={{ height: 300 }}
            notMerge
            lazyUpdate
          />
        )}
      </div>

      {/* ─── Linha 3: Top Projetos barra horizontal ─── */}
      <div className="rel-panel chart-panel chart-full">
        <h2><FaProjectDiagram /> Top Projetos por Valor em Orçamentos</h2>
        {projetoValores.length === 0 ? (
          <div className="rel-empty">Nenhum projeto encontrado.</div>
        ) : (
          <ReactECharts
            option={barProjetosOption}
            style={{ height: Math.max(220, projetoValores.length * 52) }}
            notMerge
            lazyUpdate
          />
        )}
      </div>

      {/* ─── Tabela detalhada com filtros ─── */}
      <div className="rel-panel relatorios-tabela">
        <div className="tabela-header">
          <h2><FaFileInvoiceDollar /> Orçamentos Detalhados</h2>
          {hasActiveFilter && (
            <button className="btn-clear-filter" onClick={clearFilters}>
              <FaTimes /> Limpar filtros
            </button>
          )}
        </div>

        <div className="filtros-row">
          <div className="filtro-group">
            <FilterableSelect
              options={[
                { value: '', label: 'Todos os Status' },
                ...Object.keys(STATUS_CONFIG).map((s) => ({ value: s, label: s })),
              ]}
              value={filtroStatus}
              onChange={setFiltroStatus}
              placeholder="Todos os Status"
              searchPlaceholder="Buscar status..."
            />
          </div>
          <div className="filtro-group">
            <FilterableSelect
              options={[
                { value: '', label: 'Todos os Projetos' },
                ...projetos.map((p) => ({ value: String(p.id), label: p.nome })),
              ]}
              value={filtroProjeto}
              onChange={setFiltroProjeto}
              placeholder="Todos os Projetos"
              searchPlaceholder="Buscar projeto..."
            />
          </div>
        </div>

        <div className="tabela-info">
          Exibindo <strong>{orcamentosFiltrados.length}</strong> de{' '}
          <strong>{totalOrcamentos}</strong> orçamentos
        </div>

        <Table
          data={orcamentosFiltrados}
          searchable
          searchPlaceholder="Buscar orçamento por nome, projeto ou status..."
          emptyMessage="Nenhum orçamento encontrado com os filtros aplicados."
          pageSize={10}
          columns={[
            {
              header: 'Nome',
              accessor: 'nome',
            },
            {
              header: 'Projeto',
              accessor: 'projetoNome',
              render: (val) => val || '—',
            },
            {
              header: 'Status',
              accessor: 'status',
              render: (val) => {
                const cfg = STATUS_CONFIG[val] || {};
                return (
                  <span className="status-badge-rel" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.icon} {val}
                  </span>
                );
              },
            },
            {
              header: 'Data Criação',
              accessor: 'dataCriacao',
              render: (val) => formatDate(val),
            },
            {
              header: 'Valor Total',
              accessor: 'valorTotalItens',
              render: (val) => (
                <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>
              ),
            },
          ]}
        />

        <div className="tfoot-total-row">
          <span className="tfoot-label">Total Filtrado:</span>
          <span className="td-total">
            {formatCurrency(
              orcamentosFiltrados.reduce((s, o) => s + parseFloat(o.valorTotalItens || 0), 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
