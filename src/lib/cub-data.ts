// Dados de CUB (Custo Unitário Básico) por estado - valores em R$/m²
// Valores aproximados baseados em médias de 2024

export const CUB_POR_ESTADO: Record<string, number> = {
  'AC': 1850,
  'AL': 1780,
  'AP': 1920,
  'AM': 1890,
  'BA': 1750,
  'CE': 1720,
  'DF': 2100,
  'ES': 1880,
  'GO': 1820,
  'MA': 1680,
  'MT': 1840,
  'MS': 1860,
  'MG': 1800,
  'PA': 1790,
  'PB': 1710,
  'PR': 1920,
  'PE': 1760,
  'PI': 1690,
  'RJ': 2050,
  'RN': 1740,
  'RS': 1950,
  'RO': 1830,
  'RR': 1900,
  'SC': 1940,
  'SP': 2080,
  'SE': 1730,
  'TO': 1810,
};

export const ESTADOS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];

export const PADROES = [
  { id: 'baixo', nome: 'Baixo Padrão', fator: 0.85, descricao: 'Acabamento simples' },
  { id: 'medio', nome: 'Médio Padrão', fator: 1.0, descricao: 'Acabamento padrão' },
  { id: 'alto', nome: 'Alto Padrão', fator: 1.2, descricao: 'Acabamento premium' },
];

export const PAVIMENTOS = [
  { id: 1, nome: '1 andar', fator: 1.0 },
  { id: 2, nome: '2 andares', fator: 1.15 },
  { id: 3, nome: '3 andares', fator: 1.25 },
];
