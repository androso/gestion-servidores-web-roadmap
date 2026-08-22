// =================== INTERFAZ ===================
export interface ResultadoValidacion {
  balanceada: boolean;
  mensaje: string;
  posicionError: number | null;
}

// =================== CLASE VALIDADORA ===================
export class ValidadorExpresiones {
  public validar(expresion: string): ResultadoValidacion {

    throw new Error('Método no implementado');
  }

  private esApertura(caracter: string): boolean {

    throw new Error('Método no implementado');
  }

  private esCierre(caracter: string): boolean {

    throw new Error('Método no implementado');
  }

  private coinciden(apertura: string, cierre: string): boolean {

    throw new Error('Método no implementado');
  }
}

// =================== DOM ===================
const inputExpresion = document.getElementById('expresion') as HTMLInputElement;
const btnValidar = document.getElementById('btnValidar') as HTMLButtonElement;
const resultado = document.getElementById('resultado') as HTMLElement;

// =================== EVENTOS ===================
btnValidar.addEventListener('click', () => {

});

inputExpresion.addEventListener('input', () => {

});

export {};