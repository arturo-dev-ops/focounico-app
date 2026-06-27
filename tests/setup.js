// Mock APIs de navegador que no existen en jsdom por defecto
global.Notification = class {
  constructor() {}
  static get permission() {
    return 'granted';
  }
  static requestPermission() {
    return Promise.resolve('granted');
  }
  close() {}
};

global.AudioContext = class {
  createGain() {
    return {
      connect: () => {},
      gain: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
    };
  }
  createOscillator() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      frequency: { value: 0 },
      type: 'sine',
    };
  }
  get currentTime() {
    return 0;
  }
};

global.navigator.vibrate = () => {};

// Inyectar el markup mínimo para que document.getElementById funcione
// al cargar app.js (en el módulo, el DOMContentLoaded se dispara con readyState=complete)
document.body.innerHTML = `
<main role="main">
  <section id="pantalla-volcado" class="pantalla" aria-hidden="false">
    <div class="card">
      <img src="assets/images/FocoUnico.png" alt="FocoÚnico logo" class="logo" />
      <button id="boton-tema" type="button" class="secondary small">Tema oscuro</button>
      <button id="boton-estricto" type="button" class="secondary small" aria-pressed="false">Modo estricto</button>
      <h1>FocoÚnico</h1>
      <p class="texto-intro">Escribe tu gran tarea y el sub-paso que vas a completar ahora.</p>
      <label for="tarea">Gran tarea</label>
      <input id="tarea" type="text" placeholder="Ej. Estudiar para el parcial" />
      <label for="subpaso">Sub-paso</label>
      <input id="subpaso" type="text" placeholder="Ej. Leer el capítulo 3" />
      <div class="template-group">
        <label for="plantillas">Tareas frecuentes</label>
        <div class="template-controls">
          <select id="plantillas" aria-label="Plantillas de tareas">
            <option value="">— Seleccionar plantilla —</option>
          </select>
          <button id="boton-guardar-plantilla" type="button" class="secondary small">Guardar plantilla</button>
          <button id="boton-eliminar-plantilla" type="button" class="secondary small">Eliminar</button>
        </div>
      </div>
      <div class="config-group">
        <div class="config-field">
          <label for="foco-minutos">Minutos de foco</label>
          <input id="foco-minutos" type="number" min="1" value="20" />
        </div>
        <div class="config-field">
          <label for="descanso-minutos">Minutos de descanso</label>
          <input id="descanso-minutos" type="number" min="1" value="5" />
        </div>
      </div>
      <p id="mensaje-error" class="error-message oculto" aria-live="assertive"></p>
      <div class="preset-group">
        <button type="button" class="preset" data-foco="20" data-descanso="5">20/5</button>
        <button type="button" class="preset" data-foco="25" data-descanso="5">25/5</button>
        <button type="button" class="preset" data-foco="45" data-descanso="15">45/15</button>
      </div>
      <button id="boton-iniciar" type="button">Iniciar Foco</button>
      <button id="boton-historial" type="button" class="secondary">Ver historial</button>
    </div>
  </section>

  <section id="pantalla-foco" class="pantalla oculto" aria-hidden="true">
    <div class="card foco-card">
      <div class="etiqueta">Sub-paso activo</div>
      <h2 id="texto-gran-tarea"></h2>
      <p id="texto-subpaso" class="subpaso"></p>
      <div id="contenedor-tiempo" class="cronometro">20:00</div>
      <div class="barra-progreso"><div id="barra-avance"></div></div>
      <p id="mensaje-foco" class="mensaje">Mantente concentrado hasta que termine el tiempo.</p>
      <button id="boton-pausa" class="secondary oculto" type="button">Pausa</button>
      <button id="boton-interrumpir" class="secondary oculto" type="button">Salir</button>
      <button id="boton-siguiente" class="oculto" type="button">Siguiente tarea</button>
    </div>
  </section>

  <section id="pantalla-historial" class="pantalla oculto" aria-hidden="true">
    <div class="card historial-card">
      <div class="etiqueta">Historial de sesiones</div>
      <div id="estadisticas-historial" class="historial-stats"></div>
      <div id="lista-historial" class="historial-list"></div>
      <div class="historial-actions">
        <button id="boton-borrar-historial" type="button" class="secondary small danger">Borrar historial</button>
        <button id="boton-volver" type="button">Volver</button>
      </div>
    </div>
  </section>
</main>
`;
