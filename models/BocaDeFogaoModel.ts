import RelogioModel from "./RelogioModel";

export enum EstadoDaBoca {
    INATIVADO, RODANDO, PAUSADO, TOCANDO
}

export default class BocaDeFogaoModel {
    estado: EstadoDaBoca;
    milissegundosPassados: number;
    relogioAtual: RelogioModel;
    relogioPadrao: RelogioModel;
    ultimoUpdate: number;
    constructor(minutos: number, segundos: number) {
        this.relogioAtual = new RelogioModel(minutos, segundos);
        this.relogioPadrao = new RelogioModel(minutos, segundos);
        this.milissegundosPassados = 0;
        this.estado = EstadoDaBoca.INATIVADO;
        this.ultimoUpdate = new Date().getTime();
    }

    isRodando(): boolean {
        return (this.estado == EstadoDaBoca.RODANDO);
    }

    getEndTime(): number {
        const endTime = this.ultimoUpdate + this.relogioAtual.getTime();        
        return endTime;
    }

    ajustarRelogio(): void {
        const agora = new Date().getTime();
        const tempoPassado = agora - this.ultimoUpdate;        
        let segundos = 0;
        let minutos = 0;
        if (agora < this.getEndTime()) {
            segundos = Math.round(tempoPassado / 1000);
            minutos = Math.floor(segundos / 60);
            segundos = segundos % 60;
        }

        this.relogioAtual.passarTempo(minutos * -1, segundos * -1);
    }

    acabou(): boolean {
        return (this.relogioAtual.acabou());
    }
}