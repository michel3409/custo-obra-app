export interface UserData {
  nome: string;
  email: string;
  estado: string;
}

export interface ObraData {
  area: number;
  padrao: string;
  pavimentos: number;
  segundoAndar: boolean;
  prevencao: number;
}

export interface Calculo {
  custoBase: number;
  custoPadrao: number;
  custoPavimentos: number;
  custoSegundoAndar: number;
  custoSemPrevencao: number;
  valorPrevencao: number;
  custoTotal: number;
  distribuicao: {
    materiais: number;
    maoObra: number;
    prevencao: number;
  };
}
