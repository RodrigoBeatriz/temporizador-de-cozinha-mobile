import RelogioModel from "./RelogioModel";

export enum EstadoDaBoca {
    INATIVADO, RODANDO, PAUSADO
}

export default class BocaDeFogaoModel {
    estado: EstadoDaBoca;
    milissegundosPassados: number;
    relogioAtual: RelogioModel;
    relogioPadrao: RelogioModel;
    constructor(minutos: number, segundos: number) {
        this.relogioAtual = new RelogioModel(minutos, segundos);
        this.relogioPadrao = new RelogioModel(minutos, segundos);
        this.milissegundosPassados = 0;
        this.estado = EstadoDaBoca.INATIVADO;
    }

    isRodando(): boolean {
        return (this.estado == EstadoDaBoca.RODANDO);
    }
}