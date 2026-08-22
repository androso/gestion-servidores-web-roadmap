// ==========================================================
// IMPORTACIÓN
// ==========================================================

// Importamos la clase EventEmitter desde el módulo "events" de Node.js.
// EventEmitter nos permite crear eventos personalizados y hacer que
// otros objetos escuchen esos eventos.
import { EventEmitter } from 'events';

// ==========================================================
// INTERFAZ
// ==========================================================

// Una interfaz NO crea objetos.
// Solo define cómo deben estar estructurados los datos.
//
// En este caso, cualquier alerta de crimen deberá contener:
//
// - lugar
// - villano
// - nivelPeligro
//
interface AlertaCrimen {

  // Lugar donde ocurre el crimen
  lugar: string;

  // Nombre del villano
  villano: string;

  // Solo permite uno de estos tres valores.
  // Esto evita escribir cualquier texto.
  nivelPeligro: 'Bajo' | 'Medio' | 'Alto';
}

// ==========================================================
// CLASE EMISORA
// ==========================================================

// La Central de Policía HEREDA de EventEmitter.
//
// Gracias a "extends EventEmitter"
// esta clase obtiene métodos como:
//
// emit()
// on()
// once()
// removeListener()
//
class CentralPoliciaNY extends EventEmitter {

  // --------------------------------------------------------
  // Método para reportar un incidente.
  //
  // Recibe:
  // - lugar
  // - villano
  // - nivel de peligro
  //
  // Luego crea una alerta y la envía a todos los escuchadores.
  // --------------------------------------------------------
  public reportarIncidente(

    lugar: string,
    villano: string,
    nivelPeligro: 'Bajo' | 'Medio' | 'Alto'

  ): void {

    // Mostrar un mensaje en consola.
    // Esto NO es un evento.
    // Solo informa que ocurrió un crimen.

    console.log(
      `\n🚨 [RADIO POLICIAL]: ¡Atención a todas las unidades! Se reporta un problema en ${lugar}.`
    );

    // Crear un objeto siguiendo la interfaz AlertaCrimen.

    const detallesAlerta: AlertaCrimen = {

      lugar,
      villano,
      nivelPeligro

    };

    // =====================================================
    // EMITIR EL EVENTO
    // =====================================================
    //
    // emit(nombreEvento, datos)
    //
    // nombreEvento -> "crimenEnProceso"
    //
    // datos -> detallesAlerta
    //
    // Todos los objetos que estén escuchando este evento
    // recibirán automáticamente la información.
    //
    this.emit("crimenEnProceso", detallesAlerta);
  }
}

// ==========================================================
// SPIDER-MAN
// ==========================================================

// Esta clase representa un escuchador.
//
// Spider-Man NO sabe cuándo ocurre un crimen.
//
// Simplemente tiene una función que reaccionará cuando alguien
// la llame.
//
class SpiderMan {

  // Recibe una alerta y responde.

  public columpiarseAlLugar(alerta: AlertaCrimen): void {

    console.log(

      `🕸️ [Spider-Man]: ¡Mi sentido arácnido resuena! Me columpio hacia ${alerta.lugar} para detener a ${alerta.villano}.`

    );

  }

}

// ==========================================================
// DAILY BUGLE
// ==========================================================

// Otro escuchador.
//
// Igual que Spider-Man,
// solamente espera recibir la alerta.
//
class PeriodicoDailyBugle {

  public publicarNoticia(alerta: AlertaCrimen): void {

    console.log(

      `📰 [Daily Bugle]: ¡ÚLTIMA HORA! J. Jonah Jameson exige fotos de ${alerta.villano} causando estragos en ${alerta.lugar}.`

    );

  }

}

// ==========================================================
// CREAR OBJETOS
// ==========================================================

// Crear la Central de Policía.
const centralPolicia = new CentralPoliciaNY();

// Crear Spider-Man.
const spidey = new SpiderMan();

// Crear el periódico.
const dailyBugle = new PeriodicoDailyBugle();

// ==========================================================
// SUSCRIPCIÓN AL EVENTO
// ==========================================================

// on()
// significa:
//
// "Cuando ocurra este evento,
// ejecuta esta función."
//
// Aquí Spider-Man comienza a escuchar el evento.
//
centralPolicia.on(

  // Nombre del evento que queremos escuchar.
  "crimenEnProceso",

  // Callback.
  //
  // Esta función será ejecutada automáticamente
  // cuando ocurra el evento.
  (alerta: AlertaCrimen) => {

    // Spider-Man responde.
    spidey.columpiarseAlLugar(alerta);

  }

);

// ==========================================================
// SEGUNDO ESCUCHADOR
// ==========================================================

// También podemos tener MUCHOS escuchadores.
//
// Todos reaccionarán cuando ocurra el mismo evento.
//
centralPolicia.on(

  "crimenEnProceso",

  (alerta: AlertaCrimen) => {

    dailyBugle.publicarNoticia(alerta);

  }

);

// ==========================================================
// PRUEBAS
// ==========================================================

// Simular un crimen.
//
// reportarIncidente()
//
// ↓
//
// emit()
//
// ↓
//
// Spider-Man recibe la alerta.
//
// ↓
//
// Daily Bugle recibe la alerta.
//
centralPolicia.reportarIncidente(

  "Times Square",
  "Duende Verde",
  "Alto"

);

// Otro crimen.
//
// El mismo evento vuelve a dispararse.
//
centralPolicia.reportarIncidente(

  "Banco Central",
  "Rhino",
  "Medio"

);