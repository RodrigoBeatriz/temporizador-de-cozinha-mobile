export default class RelogioModel {
    minutos: number;
    segundos: number;
    constructor(minutos: number, segundos: number) {
        this.minutos = minutos;
        this.segundos = segundos;
    }

    definirTempo(minutos: number, segundos: number): void {
        this.minutos = minutos;
        this.segundos = segundos;
    }

    passarTempo(minutos: number, segundos: number): void {
        this.minutos += minutos;
        this.minutos += segundos > 0 ? Math.floor(segundos / 60) : Math.ceil(segundos / 60);
        this.segundos += segundos % 60;
        if (this.segundos >= 60) {
            this.minutos++;
            this.segundos = 0;
        }
        if (this.segundos < 0) {
            this.minutos--;
            this.segundos = 59;
        }
    }

    toString(): string {
        return ("00" + this.minutos).slice(-2) + ":" + ("00" + this.segundos).slice(-2);
    }

    getTime(): number {
        return (this.segundos * 1000) + (this.minutos * 60 * 1000)
    }
}