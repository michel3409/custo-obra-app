'use client';

import { useState } from 'react';
import { Calculator, Home, DollarSign, TrendingUp, CheckCircle, Building2, Ruler, Info, Droplet, Flame, Shield, Car, Bed, Bath, CreditCard, Calendar, Wallet } from 'lucide-react';
import { CUB_POR_ESTADO, ESTADOS, PADROES, PAVIMENTOS } from '@/lib/cub-data';
import type { UserData, ObraData, Calculo } from '@/lib/types';

// Tipos de casa
const TIPOS_CASA = [
  { id: 'terrea', nome: 'Casa Térrea', fator: 1.0 },
  { id: 'sobrado', nome: 'Sobrado', fator: 1.15 },
  { id: 'triplex', nome: 'Triplex', fator: 1.25 },
];

// Opções de quartos e banheiros
const OPCOES_QUARTOS = [1, 2, 3, 4, 5, 6];
const OPCOES_BANHEIROS = [1, 2, 3, 4, 5, 6];

interface ObraDataExtended extends ObraData {
  tipoCasa: string;
  numQuartos: number;
  numBanheiros: number;
  garagem: boolean;
  areaLazer: boolean;
  piscina: boolean;
  churrasqueira: boolean;
  seguranca: boolean;
}

interface PlanoPagamento {
  tipo: 'vista' | 'parcelado' | 'financiamento';
  entrada?: number;
  parcelas?: number;
  valorParcela?: number;
  taxaJuros?: number;
}

export default function CustoDaObra() {
  const [etapa, setEtapa] = useState<'cadastro' | 'dados' | 'adicionais' | 'prevencao' | 'pagamento' | 'resultado'>('cadastro');
  const [userData, setUserData] = useState<UserData>({ nome: '', email: '', estado: '' });
  const [obraData, setObraData] = useState<ObraDataExtended>({
    area: 0,
    padrao: 'medio',
    pavimentos: 1,
    segundoAndar: false,
    prevencao: 10,
    tipoCasa: 'terrea',
    numQuartos: 3,
    numBanheiros: 2,
    garagem: true,
    areaLazer: false,
    piscina: false,
    churrasqueira: false,
    seguranca: false,
  });
  const [planoPagamento, setPlanoPagamento] = useState<PlanoPagamento>({
    tipo: 'vista',
    entrada: 30,
    parcelas: 12,
    taxaJuros: 1.5,
  });
  const [calculo, setCalculo] = useState<Calculo | null>(null);

  const calcularCusto = () => {
    const cubEstado = CUB_POR_ESTADO[userData.estado];
    const fatorPadrao = PADROES.find(p => p.id === obraData.padrao)?.fator || 1.0;
    const fatorPavimentos = PAVIMENTOS.find(p => p.id === obraData.pavimentos)?.fator || 1.0;
    const fatorTipoCasa = TIPOS_CASA.find(t => t.id === obraData.tipoCasa)?.fator || 1.0;

    // 4.1 Custo base pelo CUB
    const custoBase = obraData.area * cubEstado;

    // 4.2 Ajuste pelo padrão da obra
    const custoPadrao = custoBase * fatorPadrao;

    // 4.3 Ajuste por número de andares
    const custoPavimentos = custoPadrao * fatorPavimentos;

    // 4.4 Ajuste por tipo de casa
    const custoTipoCasa = custoPavimentos * fatorTipoCasa;

    // 4.5 Ajuste se a obra começa no segundo andar
    const custoSegundoAndar = obraData.segundoAndar ? custoTipoCasa * 1.10 : custoTipoCasa;

    // 4.6 Custos adicionais
    let custosAdicionais = 0;
    if (obraData.garagem) custosAdicionais += custoSegundoAndar * 0.05;
    if (obraData.areaLazer) custosAdicionais += custoSegundoAndar * 0.08;
    if (obraData.piscina) custosAdicionais += custoSegundoAndar * 0.12;
    if (obraData.churrasqueira) custosAdicionais += custoSegundoAndar * 0.04;
    if (obraData.seguranca) custosAdicionais += custoSegundoAndar * 0.03;

    // 4.7 Custo final antes da prevenção
    const custoSemPrevencao = custoSegundoAndar + custosAdicionais;

    // 4.8 Prevenção / imprevistos
    const valorPrevencao = custoSemPrevencao * (obraData.prevencao / 100);

    // 4.9 Total final
    const custoTotal = custoSemPrevencao + valorPrevencao;

    // Distribuição
    const distribuicao = {
      materiais: custoTotal * 0.50,
      maoObra: custoTotal * 0.40,
      prevencao: custoTotal * 0.10,
    };

    setCalculo({
      custoBase,
      custoPadrao,
      custoPavimentos,
      custoSegundoAndar,
      custoSemPrevencao,
      valorPrevencao,
      custoTotal,
      distribuicao,
    });

    setEtapa('resultado');
  };

  const calcularPagamento = () => {
    if (!calculo) return null;

    if (planoPagamento.tipo === 'vista') {
      return {
        desconto: calculo.custoTotal * 0.05,
        valorFinal: calculo.custoTotal * 0.95,
      };
    }

    if (planoPagamento.tipo === 'parcelado') {
      const valorEntrada = calculo.custoTotal * ((planoPagamento.entrada || 30) / 100);
      const saldoRestante = calculo.custoTotal - valorEntrada;
      const valorParcela = saldoRestante / (planoPagamento.parcelas || 12);
      
      return {
        valorEntrada,
        saldoRestante,
        valorParcela,
        valorTotal: calculo.custoTotal,
      };
    }

    if (planoPagamento.tipo === 'financiamento') {
      const valorEntrada = calculo.custoTotal * ((planoPagamento.entrada || 30) / 100);
      const saldoFinanciar = calculo.custoTotal - valorEntrada;
      const taxaMensal = (planoPagamento.taxaJuros || 1.5) / 100;
      const numParcelas = planoPagamento.parcelas || 12;
      
      // Fórmula Price
      const valorParcela = saldoFinanciar * (taxaMensal * Math.pow(1 + taxaMensal, numParcelas)) / (Math.pow(1 + taxaMensal, numParcelas) - 1);
      const valorTotal = valorEntrada + (valorParcela * numParcelas);
      const jurosTotal = valorTotal - calculo.custoTotal;
      
      return {
        valorEntrada,
        saldoFinanciar,
        valorParcela,
        valorTotal,
        jurosTotal,
      };
    }

    return null;
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const reiniciar = () => {
    setEtapa('cadastro');
    setUserData({ nome: '', email: '', estado: '' });
    setObraData({
      area: 0,
      padrao: 'medio',
      pavimentos: 1,
      segundoAndar: false,
      prevencao: 10,
      tipoCasa: 'terrea',
      numQuartos: 3,
      numBanheiros: 2,
      garagem: true,
      areaLazer: false,
      piscina: false,
      churrasqueira: false,
      seguranca: false,
    });
    setPlanoPagamento({
      tipo: 'vista',
      entrada: 30,
      parcelas: 12,
      taxaJuros: 1.5,
    });
    setCalculo(null);
  };

  // Componente Switch moderno
  const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-14 h-7 bg-gray-300 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600 transition-all duration-300 shadow-inner"></div>
        <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-7 shadow-md"></div>
      </div>
    </label>
  );

  const resultadoPagamento = calcularPagamento();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <Calculator className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Custo da Obra
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Calcule o custo estimado da sua construção com base no CUB oficial do seu estado
          </p>
        </div>

        {/* Indicador de Etapas */}
        {etapa !== 'resultado' && (
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex items-center justify-between gap-2">
              {/* Etapa 1 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  etapa === 'cadastro' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <span className={`text-xs sm:text-sm font-medium mt-2 ${etapa === 'cadastro' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Cadastro
                </span>
              </div>

              {/* Linha 1 */}
              <div className={`flex-1 h-1 rounded transition-all duration-300 ${
                etapa === 'dados' || etapa === 'adicionais' || etapa === 'prevencao' || etapa === 'pagamento' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-300'
              }`}></div>

              {/* Etapa 2 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  etapa === 'dados' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                    : (etapa === 'adicionais' || etapa === 'prevencao' || etapa === 'pagamento')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className={`text-xs sm:text-sm font-medium mt-2 ${etapa === 'dados' || etapa === 'adicionais' || etapa === 'prevencao' || etapa === 'pagamento' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Dados
                </span>
              </div>

              {/* Linha 2 */}
              <div className={`flex-1 h-1 rounded transition-all duration-300 ${
                etapa === 'adicionais' || etapa === 'prevencao' || etapa === 'pagamento' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-300'
              }`}></div>

              {/* Etapa 3 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  etapa === 'adicionais' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                    : (etapa === 'prevencao' || etapa === 'pagamento')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <span className={`text-xs sm:text-sm font-medium mt-2 ${etapa === 'adicionais' || etapa === 'prevencao' || etapa === 'pagamento' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Adicionais
                </span>
              </div>

              {/* Linha 3 */}
              <div className={`flex-1 h-1 rounded transition-all duration-300 ${
                etapa === 'prevencao' || etapa === 'pagamento' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-300'
              }`}></div>

              {/* Etapa 4 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  etapa === 'prevencao' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                    : etapa === 'pagamento'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  4
                </div>
                <span className={`text-xs sm:text-sm font-medium mt-2 ${etapa === 'prevencao' || etapa === 'pagamento' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Prevenção
                </span>
              </div>

              {/* Linha 4 */}
              <div className={`flex-1 h-1 rounded transition-all duration-300 ${
                etapa === 'pagamento' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gray-300'
              }`}></div>

              {/* Etapa 5 */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  etapa === 'pagamento' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  5
                </div>
                <span className={`text-xs sm:text-sm font-medium mt-2 ${etapa === 'pagamento' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Pagamento
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="max-w-4xl mx-auto">
          {/* ETAPA 1: CADASTRO */}
          {etapa === 'cadastro' && (
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Home className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Cadastro Rápido</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Seu nome
                  </label>
                  <input
                    type="text"
                    value={userData.nome}
                    onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-lg transition-all duration-200"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Seu e-mail
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-lg transition-all duration-200"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado da obra
                  </label>
                  <select
                    value={userData.estado}
                    onChange={(e) => setUserData({ ...userData, estado: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-lg transition-all duration-200 bg-white"
                  >
                    <option value="">Selecione o estado</option>
                    {ESTADOS.map((estado) => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.nome} ({estado.sigla})
                      </option>
                    ))}
                  </select>
                  {userData.estado && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">
                          <strong className="text-blue-600">CUB em {userData.estado}:</strong> {formatarMoeda(CUB_POR_ESTADO[userData.estado])}/m²
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setEtapa('dados')}
                  disabled={!userData.nome || !userData.email || !userData.estado}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continuar para Dados da Obra →
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 2: DADOS DA OBRA */}
          {etapa === 'dados' && (
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Building2 className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Dados da Obra</h2>
              </div>

              <div className="space-y-6">
                {/* Tipo de Casa */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tipo de casa
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TIPOS_CASA.map((tipo) => (
                      <button
                        key={tipo.id}
                        onClick={() => setObraData({ ...obraData, tipoCasa: tipo.id })}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                          obraData.tipoCasa === tipo.id
                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="font-bold text-gray-800 text-lg">{tipo.nome}</div>
                        {tipo.fator > 1 && (
                          <div className={`text-sm font-semibold mt-2 ${obraData.tipoCasa === tipo.id ? 'text-blue-600' : 'text-gray-500'}`}>
                            +{((tipo.fator - 1) * 100).toFixed(0)}%
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Área e Quartos/Banheiros em Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      Área (m²)
                    </label>
                    <input
                      type="number"
                      value={obraData.area || ''}
                      onChange={(e) => setObraData({ ...obraData, area: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-lg transition-all duration-200"
                      placeholder="Ex: 120"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Bed className="w-4 h-4" />
                      Quartos
                    </label>
                    <select
                      value={obraData.numQuartos}
                      onChange={(e) => setObraData({ ...obraData, numQuartos: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-lg transition-all duration-200 bg-white"
                    >
                      {OPCOES_QUARTOS.map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'quarto' : 'quartos'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Bath className="w-4 h-4" />
                      Banheiros
                    </label>
                    <select
                      value={obraData.numBanheiros}
                      onChange={(e) => setObraData({ ...obraData, numBanheiros: Number(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-lg transition-all duration-200 bg-white"
                    >
                      {OPCOES_BANHEIROS.map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'banheiro' : 'banheiros'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {obraData.area > 0 && userData.estado && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-700">
                      Custo base estimado: <strong className="text-blue-600 text-lg">{formatarMoeda(obraData.area * CUB_POR_ESTADO[userData.estado])}</strong>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Padrão da obra
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PADROES.map((padrao) => (
                      <button
                        key={padrao.id}
                        onClick={() => setObraData({ ...obraData, padrao: padrao.id })}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                          obraData.padrao === padrao.id
                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="font-bold text-gray-800 text-lg">{padrao.nome}</div>
                        <div className="text-sm text-gray-600 mt-1">{padrao.descricao}</div>
                        <div className={`text-sm font-semibold mt-2 ${obraData.padrao === padrao.id ? 'text-blue-600' : 'text-gray-500'}`}>
                          Fator: ×{padrao.fator}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Número de pavimentos
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {PAVIMENTOS.map((pav) => (
                      <button
                        key={pav.id}
                        onClick={() => setObraData({ ...obraData, pavimentos: pav.id })}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                          obraData.pavimentos === pav.id
                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}>
                        <div className="font-bold text-gray-800 text-lg">{pav.nome}</div>
                        {pav.fator > 1 && (
                          <div className={`text-sm font-semibold mt-1 ${obraData.pavimentos === pav.id ? 'text-blue-600' : 'text-gray-500'}`}>
                            +{((pav.fator - 1) * 100).toFixed(0)}%
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`flex items-start gap-3 cursor-pointer p-5 border-2 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    obraData.segundoAndar 
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg' 
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}>
                    <input
                      type="checkbox"
                      checked={obraData.segundoAndar}
                      onChange={(e) => setObraData({ ...obraData, segundoAndar: e.target.checked })}
                      className="w-5 h-5 text-blue-600 mt-1 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-lg">A casa começa no segundo andar?</div>
                      <div className="text-sm text-gray-600 mt-1">Garagem no térreo, pilotis, terreno em aclive</div>
                      {obraData.segundoAndar && (
                        <div className="text-sm font-semibold text-blue-600 mt-2">+10% no custo total</div>
                      )}
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEtapa('cadastro')}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={() => setEtapa('adicionais')}
                    disabled={obraData.area <= 0}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continuar para Adicionais →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3: ADICIONAIS */}
          {etapa === 'adicionais' && (
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Home className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Itens Adicionais</h2>
              </div>

              <div className="space-y-6">
                {/* Grid de Switches */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Car className="w-6 h-6 text-blue-600" />
                      <h3 className="font-bold text-gray-800 text-lg">Garagem</h3>
                    </div>
                    <Switch
                      checked={obraData.garagem}
                      onChange={(checked) => setObraData({ ...obraData, garagem: checked })}
                      label="Incluir garagem"
                    />
                    {obraData.garagem && (
                      <p className="text-sm text-blue-600 font-semibold mt-3">+5% no custo</p>
                    )}
                  </div>

                  <div className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Home className="w-6 h-6 text-green-600" />
                      <h3 className="font-bold text-gray-800 text-lg">Área de Lazer</h3>
                    </div>
                    <Switch
                      checked={obraData.areaLazer}
                      onChange={(checked) => setObraData({ ...obraData, areaLazer: checked })}
                      label="Incluir área de lazer"
                    />
                    {obraData.areaLazer && (
                      <p className="text-sm text-blue-600 font-semibold mt-3">+8% no custo</p>
                    )}
                  </div>

                  <div className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Droplet className="w-6 h-6 text-cyan-600" />
                      <h3 className="font-bold text-gray-800 text-lg">Piscina</h3>
                    </div>
                    <Switch
                      checked={obraData.piscina}
                      onChange={(checked) => setObraData({ ...obraData, piscina: checked })}
                      label="Incluir piscina"
                    />
                    {obraData.piscina && (
                      <p className="text-sm text-blue-600 font-semibold mt-3">+12% no custo</p>
                    )}
                  </div>

                  <div className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Flame className="w-6 h-6 text-orange-600" />
                      <h3 className="font-bold text-gray-800 text-lg">Churrasqueira</h3>
                    </div>
                    <Switch
                      checked={obraData.churrasqueira}
                      onChange={(checked) => setObraData({ ...obraData, churrasqueira: checked })}
                      label="Incluir churrasqueira"
                    />
                    {obraData.churrasqueira && (
                      <p className="text-sm text-blue-600 font-semibold mt-3">+4% no custo</p>
                    )}
                  </div>

                  <div className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-purple-600" />
                      <h3 className="font-bold text-gray-800 text-lg">Segurança</h3>
                    </div>
                    <Switch
                      checked={obraData.seguranca}
                      onChange={(checked) => setObraData({ ...obraData, seguranca: checked })}
                      label="Incluir itens de segurança (portão eletrônico, câmeras, alarme)"
                    />
                    {obraData.seguranca && (
                      <p className="text-sm text-blue-600 font-semibold mt-3">+3% no custo</p>
                    )}
                  </div>
                </div>

                {/* Resumo dos Adicionais */}
                {(obraData.garagem || obraData.areaLazer || obraData.piscina || obraData.churrasqueira || obraData.seguranca) && (
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Itens selecionados
                    </h3>
                    <div className="space-y-2">
                      {obraData.garagem && <p className="text-sm text-gray-700">✓ Garagem (+5%)</p>}
                      {obraData.areaLazer && <p className="text-sm text-gray-700">✓ Área de Lazer (+8%)</p>}
                      {obraData.piscina && <p className="text-sm text-gray-700">✓ Piscina (+12%)</p>}
                      {obraData.churrasqueira && <p className="text-sm text-gray-700">✓ Churrasqueira (+4%)</p>}
                      {obraData.seguranca && <p className="text-sm text-gray-700">✓ Segurança (+3%)</p>}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setEtapa('dados')}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={() => setEtapa('prevencao')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continuar para Prevenção →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4: PREVENÇÃO */}
          {etapa === 'prevencao' && (
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <DollarSign className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Custos Adicionais</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Prevenção / Imprevistos (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={obraData.prevencao}
                      onChange={(e) => setObraData({ ...obraData, prevencao: Number(e.target.value) })}
                      className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="text-4xl font-bold text-blue-600 w-24 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl py-2 border-2 border-blue-200">
                      {obraData.prevencao}%
                    </div>
                  </div>
                  <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-700 flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Recomendamos entre <strong>10% e 15%</strong> para cobrir imprevistos, taxas, licenças e custos extras que podem surgir durante a obra.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Resumo da sua obra
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 font-medium">Tipo</div>
                      <div className="text-base font-bold text-gray-800">{TIPOS_CASA.find(t => t.id === obraData.tipoCasa)?.nome}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 font-medium">Área</div>
                      <div className="text-base font-bold text-gray-800">{obraData.area}m²</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 font-medium">Padrão</div>
                      <div className="text-base font-bold text-gray-800">{PADROES.find(p => p.id === obraData.padrao)?.nome}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 font-medium">Quartos</div>
                      <div className="text-base font-bold text-gray-800">{obraData.numQuartos}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 font-medium">Banheiros</div>
                      <div className="text-base font-bold text-gray-800">{obraData.numBanheiros}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 font-medium">Estado</div>
                      <div className="text-base font-bold text-gray-800">{userData.estado}</div>
                    </div>
                  </div>
                  {(obraData.segundoAndar || obraData.garagem || obraData.areaLazer || obraData.piscina || obraData.churrasqueira || obraData.seguranca) && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                      <div className="text-sm font-semibold text-blue-700 mb-2">Adicionais:</div>
                      <div className="space-y-1">
                        {obraData.segundoAndar && <p className="text-xs text-blue-700">✓ Começa no 2º andar</p>}
                        {obraData.garagem && <p className="text-xs text-blue-700">✓ Garagem</p>}
                        {obraData.areaLazer && <p className="text-xs text-blue-700">✓ Área de Lazer</p>}
                        {obraData.piscina && <p className="text-xs text-blue-700">✓ Piscina</p>}
                        {obraData.churrasqueira && <p className="text-xs text-blue-700">✓ Churrasqueira</p>}
                        {obraData.seguranca && <p className="text-xs text-blue-700">✓ Segurança</p>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEtapa('adicionais')}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={() => setEtapa('pagamento')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continuar para Pagamento →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 5: PAGAMENTO */}
          {etapa === 'pagamento' && (
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <CreditCard className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Forma de Pagamento</h2>
              </div>

              <div className="space-y-6">
                {/* Opções de Pagamento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Como você pretende pagar?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setPlanoPagamento({ ...planoPagamento, tipo: 'vista' })}
                      className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                        planoPagamento.tipo === 'vista'
                          ? 'border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                          : 'border-gray-200 hover:border-green-300 bg-white'
                      }`}
                    >
                      <Wallet className={`w-8 h-8 mx-auto mb-2 ${planoPagamento.tipo === 'vista' ? 'text-green-600' : 'text-gray-400'}`} />
                      <div className="font-bold text-gray-800 text-lg">À Vista</div>
                      <div className="text-sm text-green-600 font-semibold mt-2">5% de desconto</div>
                    </button>

                    <button
                      onClick={() => setPlanoPagamento({ ...planoPagamento, tipo: 'parcelado' })}
                      className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                        planoPagamento.tipo === 'parcelado'
                          ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <Calendar className={`w-8 h-8 mx-auto mb-2 ${planoPagamento.tipo === 'parcelado' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="font-bold text-gray-800 text-lg">Parcelado</div>
                      <div className="text-sm text-gray-600 mt-2">Sem juros</div>
                    </button>

                    <button
                      onClick={() => setPlanoPagamento({ ...planoPagamento, tipo: 'financiamento' })}
                      className={`p-5 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                        planoPagamento.tipo === 'financiamento'
                          ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                          : 'border-gray-200 hover:border-purple-300 bg-white'
                      }`}
                    >
                      <CreditCard className={`w-8 h-8 mx-auto mb-2 ${planoPagamento.tipo === 'financiamento' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <div className="font-bold text-gray-800 text-lg">Financiamento</div>
                      <div className="text-sm text-gray-600 mt-2">Com juros</div>
                    </button>
                  </div>
                </div>

                {/* Configurações de Parcelado */}
                {planoPagamento.tipo === 'parcelado' && (
                  <div className="space-y-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Entrada (%)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="10"
                          max="50"
                          step="5"
                          value={planoPagamento.entrada}
                          onChange={(e) => setPlanoPagamento({ ...planoPagamento, entrada: Number(e.target.value) })}
                          className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="text-2xl font-bold text-blue-600 w-20 text-center bg-white rounded-lg py-1 border-2 border-blue-300">
                          {planoPagamento.entrada}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Número de parcelas
                      </label>
                      <select
                        value={planoPagamento.parcelas}
                        onChange={(e) => setPlanoPagamento({ ...planoPagamento, parcelas: Number(e.target.value) })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-lg transition-all duration-200 bg-white"
                      >
                        {[6, 12, 18, 24, 36, 48].map((num) => (
                          <option key={num} value={num}>
                            {num}x sem juros
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Configurações de Financiamento */}
                {planoPagamento.tipo === 'financiamento' && (
                  <div className="space-y-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Entrada (%)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="10"
                          max="50"
                          step="5"
                          value={planoPagamento.entrada}
                          onChange={(e) => setPlanoPagamento({ ...planoPagamento, entrada: Number(e.target.value) })}
                          className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="text-2xl font-bold text-purple-600 w-20 text-center bg-white rounded-lg py-1 border-2 border-purple-300">
                          {planoPagamento.entrada}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prazo (meses)
                      </label>
                      <select
                        value={planoPagamento.parcelas}
                        onChange={(e) => setPlanoPagamento({ ...planoPagamento, parcelas: Number(e.target.value) })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none text-lg transition-all duration-200 bg-white"
                      >
                        {[12, 24, 36, 48, 60, 84, 120, 180, 240, 360].map((num) => (
                          <option key={num} value={num}>
                            {num} meses ({(num / 12).toFixed(1)} anos)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Taxa de juros mensal (%)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0.5"
                          max="3.0"
                          step="0.1"
                          value={planoPagamento.taxaJuros}
                          onChange={(e) => setPlanoPagamento({ ...planoPagamento, taxaJuros: Number(e.target.value) })}
                          className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="text-2xl font-bold text-purple-600 w-20 text-center bg-white rounded-lg py-1 border-2 border-purple-300">
                          {planoPagamento.taxaJuros}%
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Taxa anual: {(planoPagamento.taxaJuros! * 12).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview do Pagamento */}
                {planoPagamento.tipo === 'vista' && (
                  <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Resumo do pagamento à vista
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Valor original:</span>
                        <span className="font-semibold text-gray-800">{formatarMoeda(resultadoPagamento?.valorFinal! / 0.95)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span className="font-semibold">Desconto (5%):</span>
                        <span className="font-bold">-{formatarMoeda(resultadoPagamento?.desconto!)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t-2 border-green-300">
                        <span className="font-bold text-gray-800 text-lg">Valor final:</span>
                        <span className="font-bold text-green-600 text-xl">{formatarMoeda(resultadoPagamento?.valorFinal!)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {planoPagamento.tipo === 'parcelado' && resultadoPagamento && (
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      Resumo do parcelamento
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Entrada ({planoPagamento.entrada}%):</span>
                        <span className="font-semibold text-gray-800">{formatarMoeda(resultadoPagamento.valorEntrada)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Saldo restante:</span>
                        <span className="font-semibold text-gray-800">{formatarMoeda(resultadoPagamento.saldoRestante)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t-2 border-blue-300">
                        <span className="font-bold text-gray-800">{planoPagamento.parcelas}x de:</span>
                        <span className="font-bold text-blue-600 text-xl">{formatarMoeda(resultadoPagamento.valorParcela)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 pt-2">
                        <span>Valor total:</span>
                        <span className="font-semibold">{formatarMoeda(resultadoPagamento.valorTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {planoPagamento.tipo === 'financiamento' && resultadoPagamento && (
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      Resumo do financiamento
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Entrada ({planoPagamento.entrada}%):</span>
                        <span className="font-semibold text-gray-800">{formatarMoeda(resultadoPagamento.valorEntrada)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Valor a financiar:</span>
                        <span className="font-semibold text-gray-800">{formatarMoeda(resultadoPagamento.saldoFinanciar)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t-2 border-purple-300">
                        <span className="font-bold text-gray-800">{planoPagamento.parcelas}x de:</span>
                        <span className="font-bold text-purple-600 text-xl">{formatarMoeda(resultadoPagamento.valorParcela)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-orange-600 pt-2">
                        <span>Juros totais:</span>
                        <span className="font-semibold">+{formatarMoeda(resultadoPagamento.jurosTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Valor total a pagar:</span>
                        <span className="font-semibold">{formatarMoeda(resultadoPagamento.valorTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setEtapa('prevencao')}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={calcularCusto}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-5 h-5" />
                    Ver Resultado Final
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 6: RESULTADO */}
          {etapa === 'resultado' && calculo && (
            <div className="space-y-6">
              {/* Custo Total Destaque */}
              <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl shadow-2xl p-8 sm:p-10 text-white text-center border-4 border-white">
                <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Custo Total Estimado da Obra</h2>
                <div className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 drop-shadow-lg">
                  {formatarMoeda(calculo.custoTotal)}
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 inline-block">
                  <p className="text-green-50 text-lg font-medium">
                    {TIPOS_CASA.find(t => t.id === obraData.tipoCasa)?.nome} • {obraData.area}m² • {PADROES.find(p => p.id === obraData.padrao)?.nome} • {userData.estado}
                  </p>
                </div>
              </div>

              {/* Plano de Pagamento Escolhido */}
              {resultadoPagamento && (
                <div className={`rounded-3xl shadow-2xl p-6 sm:p-8 border-4 ${
                  planoPagamento.tipo === 'vista' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' :
                  planoPagamento.tipo === 'parcelado' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' :
                  'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                }`}>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <CreditCard className={`w-6 h-6 ${
                      planoPagamento.tipo === 'vista' ? 'text-green-600' :
                      planoPagamento.tipo === 'parcelado' ? 'text-blue-600' :
                      'text-purple-600'
                    }`} />
                    Forma de Pagamento: {
                      planoPagamento.tipo === 'vista' ? 'À Vista' :
                      planoPagamento.tipo === 'parcelado' ? 'Parcelado' :
                      'Financiamento'
                    }
                  </h3>

                  {planoPagamento.tipo === 'vista' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b-2 border-green-200">
                        <span className="text-gray-700 font-medium">Valor com desconto de 5%</span>
                        <span className="font-bold text-green-600 text-2xl">{formatarMoeda(resultadoPagamento.valorFinal!)}</span>
                      </div>
                      <div className="p-4 bg-white rounded-xl">
                        <p className="text-sm text-gray-700">
                          💰 Você economiza <strong className="text-green-600">{formatarMoeda(resultadoPagamento.desconto!)}</strong> pagando à vista!
                        </p>
                      </div>
                    </div>
                  )}

                  {planoPagamento.tipo === 'parcelado' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b-2 border-blue-200">
                        <span className="text-gray-700 font-medium">Entrada</span>
                        <span className="font-bold text-blue-600 text-xl">{formatarMoeda(resultadoPagamento.valorEntrada)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b-2 border-blue-200">
                        <span className="text-gray-700 font-medium">{planoPagamento.parcelas}x sem juros</span>
                        <span className="font-bold text-blue-600 text-2xl">{formatarMoeda(resultadoPagamento.valorParcela)}</span>
                      </div>
                      <div className="p-4 bg-white rounded-xl">
                        <p className="text-sm text-gray-700">
                          📅 Parcelas mensais de <strong className="text-blue-600">{formatarMoeda(resultadoPagamento.valorParcela)}</strong> por {planoPagamento.parcelas} meses
                        </p>
                      </div>
                    </div>
                  )}

                  {planoPagamento.tipo === 'financiamento' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b-2 border-purple-200">
                        <span className="text-gray-700 font-medium">Entrada</span>
                        <span className="font-bold text-purple-600 text-xl">{formatarMoeda(resultadoPagamento.valorEntrada)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b-2 border-purple-200">
                        <span className="text-gray-700 font-medium">{planoPagamento.parcelas}x de</span>
                        <span className="font-bold text-purple-600 text-2xl">{formatarMoeda(resultadoPagamento.valorParcela)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b-2 border-purple-200">
                        <span className="text-gray-700 font-medium">Juros totais</span>
                        <span className="font-bold text-orange-600 text-lg">+{formatarMoeda(resultadoPagamento.jurosTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-bold text-xl">Total a pagar</span>
                        <span className="font-bold text-purple-600 text-2xl">{formatarMoeda(resultadoPagamento.valorTotal)}</span>
                      </div>
                      <div className="p-4 bg-white rounded-xl">
                        <p className="text-sm text-gray-700">
                          🏦 Financiamento em {planoPagamento.parcelas} meses ({(planoPagamento.parcelas! / 12).toFixed(1)} anos) com taxa de {planoPagamento.taxaJuros}% a.m.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Breakdown Detalhado */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Detalhamento do Custo
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b-2 border-gray-100">
                    <span className="text-gray-700 font-medium">Custo Base (CUB × Área)</span>
                    <span className="font-bold text-gray-900 text-lg">{formatarMoeda(calculo.custoBase)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b-2 border-gray-100">
                    <span className="text-gray-700 font-medium">Ajuste por padrão ({PADROES.find(p => p.id === obraData.padrao)?.nome})</span>
                    <span className="font-bold text-blue-600 text-lg">+{formatarMoeda(calculo.custoPadrao - calculo.custoBase)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b-2 border-gray-100">
                    <span className="text-gray-700 font-medium">Ajuste por pavimentos ({obraData.pavimentos} {obraData.pavimentos === 1 ? 'andar' : 'andares'})</span>
                    <span className="font-bold text-blue-600 text-lg">+{formatarMoeda(calculo.custoPavimentos - calculo.custoPadrao)}</span>
                  </div>
                  {obraData.segundoAndar && (
                    <div className="flex justify-between items-center pb-4 border-b-2 border-gray-100">
                      <span className="text-gray-700 font-medium">Ajuste segundo andar (+10%)</span>
                      <span className="font-bold text-blue-600 text-lg">+{formatarMoeda(calculo.custoSegundoAndar - calculo.custoPavimentos)}</span>
                    </div>
                  )}
                  {(obraData.garagem || obraData.areaLazer || obraData.piscina || obraData.churrasqueira || obraData.seguranca) && (
                    <div className="flex justify-between items-center pb-4 border-b-2 border-gray-100">
                      <span className="text-gray-700 font-medium">Itens adicionais</span>
                      <span className="font-bold text-blue-600 text-lg">+{formatarMoeda(calculo.custoSemPrevencao - calculo.custoSegundoAndar)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-4 border-b-2 border-gray-100">
                    <span className="text-gray-700 font-medium">Prevenção e imprevistos ({obraData.prevencao}%)</span>
                    <span className="font-bold text-orange-600 text-lg">+{formatarMoeda(calculo.valorPrevencao)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-900 font-bold text-xl">TOTAL</span>
                    <span className="font-bold text-green-600 text-2xl">{formatarMoeda(calculo.custoTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Distribuição */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Para onde vai o seu dinheiro
                </h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-semibold">Materiais (50%)</span>
                      <span className="font-bold text-gray-900 text-lg">{formatarMoeda(calculo.distribuicao.materiais)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full shadow-inner transition-all duration-1000 ease-out" style={{ width: '50%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-semibold">Mão de obra (40%)</span>
                      <span className="font-bold text-gray-900 text-lg">{formatarMoeda(calculo.distribuicao.maoObra)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full shadow-inner transition-all duration-1000 ease-out delay-100" style={{ width: '40%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-semibold">Prevenção e extras (10%)</span>
                      <span className="font-bold text-gray-900 text-lg">{formatarMoeda(calculo.distribuicao.prevencao)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full shadow-inner transition-all duration-1000 ease-out delay-200" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-orange-200">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-orange-700">Importante:</strong> Esta é uma estimativa baseada no CUB oficial. Os valores reais podem variar conforme fornecedores, localização específica e especificações detalhadas do projeto.
                    </span>
                  </p>
                </div>
              </div>

              {/* Botão Nova Simulação */}
              <button
                onClick={reiniciar}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                ← Fazer Nova Simulação
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <p className="font-semibold text-gray-700 mb-2">📊 Sobre os valores do CUB</p>
            <p className="mb-1">* Valores estimados baseados no CUB (Custo Unitário Básico) oficial de cada estado</p>
            <p>Os valores reais podem variar conforme fornecedores, localização específica e especificações detalhadas do projeto</p>
          </div>
        </div>
      </div>
    </div>
  );
}
