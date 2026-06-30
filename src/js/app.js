/* ===================== HELPERS DRY ===================== */

/** Lee y parsea JSON de localStorage con fallback seguro */
function leerJSON(clave) {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Serializa y guarda un valor como JSON en localStorage */
function escribirJSON(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

/** Valida que un número sea entero positivo */
function enteroPositivo(valor, fallback) {
  const n = parseInt(valor, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/** Reproduce sonido, vibra y muestra notificación del tipo indicado ('foco' | 'descanso') */
function alertarFinDeCiclo(tipo) {
  reproducirSonido(tipo);
  vibrar();
  mostrarNotificacion(tipo);
}

/* ===================== CONSTANTES DOM ===================== */

const pantallaVolcado = document.getElementById('pantalla-volcado');
const pantallaFoco = document.getElementById('pantalla-foco');
const botonIniciar = document.getElementById('boton-iniciar');
const botonSiguiente = document.getElementById('boton-siguiente');
const botonHistorial = document.getElementById('boton-historial');
const botonVolver = document.getElementById('boton-volver');
const pantallaHistorial = document.getElementById('pantalla-historial');
const listaHistorial = document.getElementById('lista-historial');
const inputTarea = document.getElementById('tarea');
const inputSubpaso = document.getElementById('subpaso');
const inputFocoMinutos = document.getElementById('foco-minutos');
const inputDescansoMinutos = document.getElementById('descanso-minutos');
const presetButtons = document.querySelectorAll('.preset');
const botonTema = document.getElementById('boton-tema');
const botonEstricto = document.getElementById('boton-estricto');
const selectPlantillas = document.getElementById('plantillas');
const botonGuardarPlantilla = document.getElementById('boton-guardar-plantilla');
const botonEliminarPlantilla = document.getElementById('boton-eliminar-plantilla');
const mensajeError = document.getElementById('mensaje-error');
const botonPausa = document.getElementById('boton-pausa');
const botonInterrumpir = document.getElementById('boton-interrumpir');
const barraAvance = document.getElementById('barra-avance');
const estadisticasHistorial = document.getElementById('estadisticas-historial');
const textoGranTarea = document.getElementById('texto-gran-tarea');
const textoSubpaso = document.getElementById('texto-subpaso');
const contenedorTiempo = document.getElementById('contenedor-tiempo');
const mensajeFoco = document.getElementById('mensaje-foco');

/* ===================== ESTADO GLOBAL ===================== */

let intervalo;
let tiempoRestante = 20 * 60;
let focoMinutos = 20;
let descansoMinutos = 5;
let enDescanso = false;
let estaPausado = false;
let temaOscuro = false;
let historial = [];
let audioContext;
let modoEstricto = false;
let sesionEnCurso = null;
let sesionCargadaParaReanudar = null;

/* ===================== UTILIDADES ===================== */

function formatearTiempo(segundos) {
  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
  const segundosRestantes = String(segundos % 60).padStart(2, '0');
  return `${minutos}:${segundosRestantes}`;
}

function obtenerConfiguracion() {
  focoMinutos = enteroPositivo(localStorage.getItem('focoMinutos'), 20);
  descansoMinutos = enteroPositivo(localStorage.getItem('descansoMinutos'), 5);
  inputFocoMinutos.value = focoMinutos;
  inputDescansoMinutos.value = descansoMinutos;
  actualizarPresetActivo();
}

function guardarConfiguracion() {
  focoMinutos = enteroPositivo(inputFocoMinutos.value, 20);
  descansoMinutos = enteroPositivo(inputDescansoMinutos.value, 5);
  inputFocoMinutos.value = focoMinutos;
  inputDescansoMinutos.value = descansoMinutos;
  localStorage.setItem('focoMinutos', focoMinutos);
  localStorage.setItem('descansoMinutos', descansoMinutos);

  const presetKey = `${focoMinutos}-${descansoMinutos}`;
  const esPresetValido = Array.from(presetButtons).some(
    (button) => `${button.dataset.foco}-${button.dataset.descanso}` === presetKey
  );
  if (esPresetValido) {
    localStorage.setItem('presetSeleccionado', presetKey);
  } else {
    localStorage.removeItem('presetSeleccionado');
  }
  actualizarPresetActivo();
}

function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.classList.remove('oculto');
}

function ocultarError() {
  mensajeError.textContent = '';
  mensajeError.classList.add('oculto');
}

function actualizarProgreso() {
  const totalSegundos = enDescanso ? descansoMinutos * 60 : focoMinutos * 60;
  const avance = totalSegundos > 0 ? Math.round(((totalSegundos - tiempoRestante) / totalSegundos) * 100) : 0;
  barraAvance.style.width = `${Math.min(Math.max(avance, 0), 100)}%`;
}

function reproducirSonido(tipo) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const duracion = 0.2;
    const frecuencia = tipo === 'foco' ? 880 : 660;
    const ganancia = audioContext.createGain();
    const oscilador = audioContext.createOscillator();
    oscilador.type = 'sine';
    oscilador.frequency.value = frecuencia;
    oscilador.connect(ganancia);
    ganancia.connect(audioContext.destination);
    ganancia.gain.setValueAtTime(0.001, audioContext.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    ganancia.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duracion);
    oscilador.start(audioContext.currentTime);
    oscilador.stop(audioContext.currentTime + duracion);
  } catch (error) {
    console.warn('No se puede reproducir sonido:', error);
  }
}

function solicitarPermisoNotificacion() {
  if (!('Notification' in window) || Notification.permission !== 'default') return;
  Notification.requestPermission();
}

function mostrarNotificacion(tipo) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const esFoco = tipo === 'foco';
  const notificacion = new Notification(
    esFoco ? 'Foco completado' : 'Descanso terminado',
    {
      body: esFoco
        ? 'Termina el ciclo y disfruta un pequeño descanso.'
        : 'Tu descanso ha terminado. Vuelve a concentrarte.',
      icon: 'assets/images/FocoUnico.png',
    }
  );
  setTimeout(() => notificacion.close(), 5000);
}

function vibrar() {
  if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
}

/* ===================== TEMA ===================== */

function establecerTema(oscuro) {
  temaOscuro = oscuro;
  document.body.classList.toggle('dark-mode', oscuro);
  botonTema.textContent = oscuro ? 'Tema claro' : 'Tema oscuro';
  localStorage.setItem('temaOscuro', oscuro ? '1' : '0');

  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.setAttribute('name', 'theme-color');
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute('content', oscuro ? '#081011' : '#5f6f83');

  document.body.style.transition = 'background 0.25s ease, color 0.25s ease';
  botonTema.setAttribute('aria-pressed', oscuro ? 'true' : 'false');
}

function cargarTema() {
  establecerTema(localStorage.getItem('temaOscuro') === '1');
}

/* ===================== MODO ESTRICTO ===================== */

function establecerModoEstricto(valor) {
  modoEstricto = Boolean(valor);
  botonEstricto.setAttribute('aria-pressed', modoEstricto ? 'true' : 'false');
  botonEstricto.textContent = modoEstricto ? 'Estricto: ON' : 'Estricto: OFF';
  botonEstricto.classList.toggle('estricto-on', modoEstricto);
  localStorage.setItem('modoEstricto', modoEstricto ? '1' : '0');
}

function aplicarModoEstricto(activar) {
  const disabled = Boolean(activar && modoEstricto);
  [inputTarea, inputSubpaso, inputFocoMinutos, inputDescansoMinutos].forEach(el => el.disabled = disabled);
  presetButtons.forEach(b => b.disabled = disabled);
  [selectPlantillas, botonGuardarPlantilla, botonEliminarPlantilla, botonHistorial, botonVolver].forEach(el => {
    if (el) el.disabled = disabled;
  });
  botonPausa.disabled = false;
}

function cargarModoEstricto() {
  establecerModoEstricto(localStorage.getItem('modoEstricto') === '1');
}

/* ===================== HISTORIAL Y ESTADÍSTICAS ===================== */

function dibujarEstadisticas() {
  const total = historial.length;
  const completadas = historial.filter((item) => item.completado).length;
  const minutosFoco = historial.reduce((sum, item) => sum + Number(item.foco), 0);
  const minutosDescanso = historial.reduce((sum, item) => sum + Number(item.descanso), 0);
  estadisticasHistorial.innerHTML = `
    <span><strong>Sesiones</strong><strong>${total}</strong></span>
    <span><strong>Completadas</strong><strong>${completadas}</strong></span>
    <span><strong>Foco total</strong><strong>${minutosFoco} min</strong></span>
    <span><strong>Descanso total</strong><strong>${minutosDescanso} min</strong></span>
  `;
}

function obtenerHistorial() {
  historial = leerJSON('historialSesiones');
}

function guardarHistorial() {
  escribirJSON('historialSesiones', historial);
}

function agregarHistorial(tarea, subpaso, foco, descanso, completado) {
  historial.unshift({
    fecha: new Date().toISOString(),
    tarea, subpaso, foco, descanso, completado,
  });
  if (historial.length > 10) historial.pop();
  guardarHistorial();
}

/* ===================== SESIONES PENDIENTES ===================== */

let togglePendientesAbierto = false;

function toggleListaPendientes() {
  const contenedor = document.getElementById('lista-pendientes-contenedor');
  if (!contenedor) return;
  togglePendientesAbierto = !togglePendientesAbierto;
  contenedor.classList.toggle('oculto', !togglePendientesAbierto);
  if (togglePendientesAbierto) dibujarListaPendientes();
}

function dibujarListaPendientes() {
  const contenedor = document.getElementById('lista-pendientes-contenedor');
  if (!contenedor) return;
  const pendientes = obtenerSesionesPendientes().filter(p => !p.completada);
  if (!pendientes.length) {
    contenedor.innerHTML = '<p class="pendientes-vacio">No hay tareas pendientes.</p>';
    return;
  }
  contenedor.innerHTML = '<div class="pendientes-lista">' +
    pendientes.map(p => {
      const tieneTiempo = p.tiempoRestante != null && p.tiempoRestante > 0;
      return `
      <button type="button" class="pendientes-item${tieneTiempo ? ' tiene-tiempo' : ''}" data-id="${p.id}">
        <strong>${typeof p.tarea === 'string' ? p.tarea : ''}</strong>
        <span>${typeof p.subpaso === 'string' ? p.subpaso : ''}${tieneTiempo ? ' · ⏱ ' + formatearTiempo(p.tiempoRestante) : ''}</span>
      </button>`;
    }).join('') + '</div>';
  contenedor.querySelectorAll('.pendientes-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const pendientes = obtenerSesionesPendientes();
      const sesion = pendientes.find(p => p.id === id);
      if (!sesion) return;

      // Si tiene tiempo guardado, reanudar directamente (manteniéndola como pendiente para poder actualizarla al salir)
      if (sesion.tiempoRestante != null && sesion.tiempoRestante > 0) {
        tiempoRestante = sesion.tiempoRestante;
        enDescanso = sesion.enDescanso || false;
        textoGranTarea.textContent = sesion.tarea || '';
        textoSubpaso.textContent = sesion.subpaso || '';
        sesionEnCurso = { tarea: sesion.tarea, subpaso: sesion.subpaso };
        // NO marcar como completada, para que se pueda actualizar al salir
        mostrarPantallaFoco();
        iniciarTemporizador();
        return;
      }

      // Si no tiene tiempo, solo cargar en inputs
      inputTarea.value = sesion.tarea || '';
      inputSubpaso.value = sesion.subpaso || '';
      sesionCargadaParaReanudar = null;
      botonIniciar.textContent = 'Iniciar Foco';
      ocultarError();
      inputTarea.focus();
    });
  });
}

function obtenerSesionesPendientes() {
  return leerJSON('sesionesPendientes');
}

function guardarSesionesPendientes(pendientes) {
  escribirJSON('sesionesPendientes', pendientes);
}

function agregarSesionPendiente(tarea, subpaso, tiempoRestanteSesion) {
  const pendientes = obtenerSesionesPendientes();
  pendientes.unshift({
    id: Date.now() + Math.random(),
    tarea, subpaso,
    fecha: new Date().toISOString(),
    completada: false,
    tiempoRestante: tiempoRestanteSesion != null ? tiempoRestanteSesion : null,
    enDescanso: null,
  });
  if (pendientes.length > 50) pendientes.pop();
  guardarSesionesPendientes(pendientes);
  actualizarContadorPendientes();
}

function marcarSesionCompletada(id) {
  const pendientes = obtenerSesionesPendientes();
  const sesion = pendientes.find(p => p.id === id);
  if (sesion) sesion.completada = true;
  guardarSesionesPendientes(pendientes);
  actualizarContadorPendientes();
}

function actualizarContadorPendientes() {
  const pendientes = obtenerSesionesPendientes();
  // Limpiar completadas antes de calcular el contador
  limpiarPendientesCompletadas(false);
  const sinCompletar = pendientes.filter(p => !p.completada).length;
  let indicador = document.getElementById('indicador-pendientes');
  if (!indicador) {
    const card = document.querySelector('#pantalla-volcado .card');
    if (!card) return;
    // Crear contenedor del indicador + lista
    const wrapper = document.createElement('div');
    wrapper.className = 'pendientes-wrapper';
    indicador = document.createElement('div');
    indicador.id = 'indicador-pendientes';
    indicador.className = 'pendientes-indicator';
    indicador.setAttribute('tabindex', '0');
    indicador.setAttribute('role', 'button');
    indicador.setAttribute('aria-expanded', 'false');
    const listaCont = document.createElement('div');
    listaCont.id = 'lista-pendientes-contenedor';
    listaCont.className = 'pendientes-lista-contenedor oculto';
    wrapper.appendChild(indicador);
    wrapper.appendChild(listaCont);
    card.insertBefore(wrapper, card.querySelector('#boton-historial'));
    // Evento click en el indicador
    indicador.addEventListener('click', toggleListaPendientes);
  }
  if (sinCompletar > 0) {
    indicador.innerHTML = `📋 <strong>${sinCompletar}</strong> tarea${sinCompletar !== 1 ? 's' : ''} pendiente${sinCompletar !== 1 ? 's' : ''} <span class="pendientes-flecha">${togglePendientesAbierto ? '▲' : '▼'}</span>`;
    indicador.classList.remove('oculto');
    indicador.setAttribute('aria-expanded', togglePendientesAbierto ? 'true' : 'false');
  } else {
    indicador.classList.add('oculto');
    // Cerrar lista si está abierta
    const contenedor = document.getElementById('lista-pendientes-contenedor');
    if (contenedor && !contenedor.classList.contains('oculto')) {
      togglePendientesAbierto = true;
      toggleListaPendientes();
    }
  }
}

function limpiarPendientesCompletadas(actualizar = true) {
  const pendientes = obtenerSesionesPendientes();
  const filtradas = pendientes.filter(p => !p.completada);
  guardarSesionesPendientes(filtradas);
  if (actualizar) actualizarContadorPendientes();
}

/* ===================== PLANTILLAS ===================== */

function obtenerPlantillas() {
  return leerJSON('plantillasTareas');
}

function guardarPlantillas(plantillas) {
  escribirJSON('plantillasTareas', plantillas);
}

function cargarPlantillas() {
  const plantillas = obtenerPlantillas();
  selectPlantillas.innerHTML = '<option value="">— Seleccionar plantilla —</option>';
  plantillas.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = p.name;
    selectPlantillas.appendChild(opt);
  });
  selectPlantillas.value = '';
  if (botonEliminarPlantilla) botonEliminarPlantilla.disabled = plantillas.length === 0;
}

function guardarPlantillaHandler() {
  const tareaValor = inputTarea.value.trim();
  const subpasoValor = inputSubpaso.value.trim();
  if (!tareaValor && !subpasoValor) {
    mostrarError('Rellena la tarea o sub-paso antes de guardar una plantilla.');
    return;
  }
  const nombre = (tareaValor || subpasoValor).slice(0, 40);
  const plantillas = obtenerPlantillas();
  plantillas.push({ name: nombre, tarea: tareaValor, subpaso: subpasoValor });
  guardarPlantillas(plantillas);
  cargarPlantillas();
}

function eliminarPlantillaHandler() {
  const idx = selectPlantillas.value;
  if (!idx) { mostrarError('Selecciona primero una plantilla para eliminar.'); return; }
  const plantillas = obtenerPlantillas();
  plantillas.splice(Number(idx), 1);
  guardarPlantillas(plantillas);
  cargarPlantillas();
}

function aplicarPlantillaPorIndice(idx) {
  const plantillas = obtenerPlantillas();
  const p = plantillas[Number(idx)];
  if (!p) return;
  inputTarea.value = p.tarea || '';
  inputSubpaso.value = p.subpaso || '';
}

/* ===================== PANTALLAS (NAVEGACIÓN) ===================== */

function setAriaAndInert(elemento, hidden) {
  elemento.setAttribute('aria-hidden', hidden ? 'true' : 'false');
  if ('inert' in elemento) elemento.inert = hidden;
}

function mostrarPantallaSegura(pantallaActiva, focusTarget) {
  const todasPantallas = [pantallaVolcado, pantallaFoco, pantallaHistorial];
  pantallaActiva.classList.remove('oculto');
  setAriaAndInert(pantallaActiva, false);
  if (focusTarget) {
    setTimeout(() => {
      focusTarget.focus();
      todasPantallas.forEach((p) => {
        if (p !== pantallaActiva) {
          p.classList.add('oculto');
          setAriaAndInert(p, true);
        }
      });
    }, 0);
  } else {
    todasPantallas.forEach((p) => {
      if (p !== pantallaActiva) {
        p.classList.add('oculto');
        setAriaAndInert(p, true);
      }
    });
  }
}

function mostrarPantallaHistorial() {
  mostrarPantallaSegura(pantallaHistorial, botonVolver);
  dibujarHistorial();
}

function mostrarPantallaVolcado() {
  // Guardar tiempo restante en la sesión pendiente si se interrumpe
  if (sesionEnCurso && intervalo) {
    const pendientes = obtenerSesionesPendientes();
    const pendiente = pendientes.find(p =>
      !p.completada &&
      (sesionEnCurso.id ? p.id === sesionEnCurso.id : (p.tarea === sesionEnCurso.tarea && p.subpaso === sesionEnCurso.subpaso))
    );
    if (pendiente && tiempoRestante > 0) {
      pendiente.tiempoRestante = tiempoRestante;
      pendiente.enDescanso = enDescanso;
      guardarSesionesPendientes(pendientes);
      actualizarContadorPendientes();
    }
  }

  mostrarPantallaSegura(pantallaVolcado, inputTarea);
  botonSiguiente.classList.add('oculto');
  botonPausa.classList.add('oculto');
  estaPausado = false;
  aplicarModoEstricto(false);
  enDescanso = false;
  mensajeFoco.textContent = 'Mantente concentrado hasta que termine el tiempo.';
  document.body.classList.remove('descanso');
  tiempoRestante = focoMinutos * 60;
  contenedorTiempo.textContent = formatearTiempo(tiempoRestante);
  actualizarProgreso();
  clearInterval(intervalo);
}

function mostrarPantallaFoco() {
  mostrarPantallaSegura(pantallaFoco, botonPausa);
  botonPausa.classList.remove('oculto');
  if (botonInterrumpir) botonInterrumpir.classList.remove('oculto');
  botonPausa.textContent = estaPausado ? 'Reanudar' : 'Pausa';
  actualizarProgreso();
}

function dibujarHistorial() {
  listaHistorial.innerHTML = '';
  if (!historial.length) {
    listaHistorial.innerHTML = '<p class="texto-intro">Aún no hay sesiones registradas.</p>';
    return;
  }
  historial.forEach((registro) => {
    const item = document.createElement('div');
    item.className = 'historial-item';
    item.innerHTML = `
      <div class="historial-meta">
        <strong>${registro.tarea}</strong>
        <span>${new Date(registro.fecha).toLocaleString()}</span>
      </div>
      <p>${registro.subpaso}</p>
      <div class="historial-detalle">
        ${registro.foco} min foco · ${registro.descanso} min descanso · ${registro.completado ? 'Completado' : 'No completado'}
      </div>
    `;
    listaHistorial.appendChild(item);
  });
}

/* ===================== TEMPORIZADOR ===================== */

function alternarPausa() {
  if (!intervalo) return;
  estaPausado = !estaPausado;
  if (estaPausado) {
    clearInterval(intervalo);
    botonPausa.textContent = 'Reanudar';
    mensajeFoco.textContent = 'Temporizador pausado. Pulsa para continuar.';
  } else {
    botonPausa.textContent = 'Pausa';
    mensajeFoco.textContent = enDescanso
      ? 'Disfruta tu descanso hasta que termine el tiempo.'
      : 'Mantente concentrado hasta que termine el tiempo.';
    iniciarTemporizador();
  }
}

function seleccionarPreset(foco, descanso) {
  focoMinutos = foco;
  descansoMinutos = descanso;
  inputFocoMinutos.value = focoMinutos;
  inputDescansoMinutos.value = descansoMinutos;
  guardarConfiguracion();
  actualizarPresetActivo();
}

function actualizarPresetActivo() {
  presetButtons.forEach((button) => {
    const focoPreset = parseInt(button.dataset.foco, 10);
    const descansoPreset = parseInt(button.dataset.descanso, 10);
    button.classList.toggle('active', focoPreset === focoMinutos && descansoPreset === descansoMinutos);
  });
}

function iniciarTemporizador() {
  clearInterval(intervalo);
  estaPausado = false;
  botonPausa.textContent = 'Pausa';
  contenedorTiempo.textContent = formatearTiempo(tiempoRestante);
  actualizarProgreso();
  aplicarModoEstricto(true);

  intervalo = setInterval(() => {
    tiempoRestante -= 1;
    contenedorTiempo.textContent = formatearTiempo(tiempoRestante);
    actualizarProgreso();

    if (tiempoRestante <= 0) {
      clearInterval(intervalo);
      if (!enDescanso) {
        alertarFinDeCiclo('foco');
        comenzarDescanso();
      } else {
        alertarFinDeCiclo('descanso');
        finalizarDescanso();
        registrarSesion(true);
        aplicarModoEstricto(false);
      }
    }
  }, 1000);
}

function comenzarDescanso() {
  enDescanso = true;
  document.body.classList.add('descanso');
  mensajeFoco.textContent = '¡Para! Levántate, estira las piernas y bebe agua.';
  tiempoRestante = descansoMinutos * 60;
  contenedorTiempo.textContent = formatearTiempo(tiempoRestante);
  actualizarProgreso();
  iniciarTemporizador();
}

function finalizarDescanso() {
  mensajeFoco.textContent = 'Descanso terminado. Pulsa el botón para volver a la pantalla de volcado.';
  botonSiguiente.classList.remove('oculto');
}

function registrarSesion(completado) {
  agregarHistorial(
    textoGranTarea.textContent,
    textoSubpaso.textContent,
    focoMinutos,
    descansoMinutos,
    completado
  );
}

/* ===================== BORRAR HISTORIAL ===================== */

function borrarHistorialHandler() {
  if (historial.length === 0) return;
  if (!confirm('¿Estás seguro de que quieres borrar todo el historial de sesiones?')) return;
  historial = [];
  guardarHistorial();
  dibujarEstadisticas();
  dibujarHistorial();
}

/* ===================== EVENTOS ===================== */

botonIniciar.addEventListener('click', () => {
  const tareaValor = inputTarea.value.trim();
  const subpasoValor = inputSubpaso.value.trim();

  if (!tareaValor || !subpasoValor) {
    mostrarError('Por favor completa la gran tarea y el sub-paso antes de iniciar.');
    if (!tareaValor) inputTarea.focus();
    else inputSubpaso.focus();
    return;
  }

  // Si hay una sesión cargada para reanudar, reanudarla directamente
  if (sesionCargadaParaReanudar) {
    tiempoRestante = sesionCargadaParaReanudar.tiempoRestante;
    enDescanso = sesionCargadaParaReanudar.enDescanso;
    textoGranTarea.textContent = sesionCargadaParaReanudar.tarea;
    textoSubpaso.textContent = sesionCargadaParaReanudar.subpaso;
    sesionEnCurso = {
      tarea: sesionCargadaParaReanudar.tarea,
      subpaso: sesionCargadaParaReanudar.subpaso
    };
    // Marcar la sesión anterior como completada (se reanuda)
    marcarSesionCompletada(sesionCargadaParaReanudar.id);
    sesionCargadaParaReanudar = null;
    botonIniciar.textContent = 'Iniciar Foco';
    mostrarPantallaFoco();
    iniciarTemporizador();
    return;
  }

  solicitarPermisoNotificacion();
  guardarConfiguracion();
  tiempoRestante = focoMinutos * 60;
  textoGranTarea.textContent = tareaValor;
  textoSubpaso.textContent = subpasoValor;

  sesionEnCurso = { tarea: tareaValor, subpaso: subpasoValor };
  agregarSesionPendiente(tareaValor, subpasoValor, null);

  mostrarPantallaFoco();
  iniciarTemporizador();
});

botonSiguiente.addEventListener('click', () => {
  if (sesionEnCurso) {
    const pendientes = obtenerSesionesPendientes();
    const sesionPendiente = pendientes.find(p =>
      !p.completada &&
      p.tarea === sesionEnCurso.tarea &&
      p.subpaso === sesionEnCurso.subpaso
    );
    if (sesionPendiente) marcarSesionCompletada(sesionPendiente.id);
    sesionEnCurso = null;
  }
  mostrarPantallaVolcado();
});

botonHistorial.addEventListener('click', mostrarPantallaHistorial);
botonTema.addEventListener('click', () => establecerTema(!temaOscuro));
if (botonEstricto) botonEstricto.addEventListener('click', () => establecerModoEstricto(!modoEstricto));
botonInterrumpir.addEventListener('click', () => {
  // Guardar tiempo restante en sesión pendiente
  if (sesionEnCurso && tiempoRestante > 0) {
    const pendientes = obtenerSesionesPendientes();
    const pendiente = pendientes.find(p =>
      !p.completada &&
      p.tarea === sesionEnCurso.tarea &&
      p.subpaso === sesionEnCurso.subpaso
    );
    if (pendiente) {
      pendiente.tiempoRestante = tiempoRestante;
      pendiente.enDescanso = enDescanso;
      guardarSesionesPendientes(pendientes);
    }
  }
  sesionEnCurso = null;
  mostrarPantallaVolcado();
});

botonPausa.addEventListener('click', alternarPausa);

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    seleccionarPreset(parseInt(button.dataset.foco, 10), parseInt(button.dataset.descanso, 10));
  });
});

if (botonGuardarPlantilla) botonGuardarPlantilla.addEventListener('click', guardarPlantillaHandler);
if (botonEliminarPlantilla) botonEliminarPlantilla.addEventListener('click', eliminarPlantillaHandler);
if (selectPlantillas) selectPlantillas.addEventListener('change', (e) => {
  if (e.target.value) aplicarPlantillaPorIndice(e.target.value);
});

[inputTarea, inputSubpaso, inputFocoMinutos, inputDescansoMinutos].forEach((el) => {
  if (el) el.addEventListener('input', () => {
    ocultarError();
    // Si el usuario cambia los inputs manualmente, resetear el botón
    sesionCargadaParaReanudar = null;
    botonIniciar.textContent = 'Iniciar Foco';
  });
});

document.addEventListener('keydown', (event) => {
  if (event.code === 'Enter' && !pantallaVolcado.classList.contains('oculto')) {
    botonIniciar.click();
  }
  if (event.code === 'Space' && !pantallaFoco.classList.contains('oculto')) {
    event.preventDefault();
    alternarPausa();
  }
});

/* ===================== INICIALIZACIÓN ===================== */

function iniciarApp() {
  obtenerConfiguracion();
  obtenerHistorial();
  cargarPlantillas();
  cargarTema();
  cargarModoEstricto();
  dibujarEstadisticas();
  actualizarContadorPendientes();

  botonTema.setAttribute('aria-pressed', temaOscuro ? 'true' : 'false');
  [pantallaVolcado, pantallaFoco, pantallaHistorial].forEach(p => {
    p.setAttribute('aria-hidden', p.classList.contains('oculto') ? 'true' : 'false');
  });

  const botonBorrarHistorial = document.getElementById('boton-borrar-historial');
  if (botonBorrarHistorial) botonBorrarHistorial.addEventListener('click', borrarHistorialHandler);

  botonVolver.addEventListener('click', mostrarPantallaVolcado);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarApp);
} else {
  iniciarApp();
}

export {
  formatearTiempo,
  enteroPositivo,
  leerJSON,
  escribirJSON,
  alertarFinDeCiclo,
  obtenerConfiguracion,
  guardarConfiguracion,
  mostrarError,
  ocultarError,
  actualizarProgreso,
  reproducirSonido,
  mostrarNotificacion,
  vibrar,
  iniciarTemporizador,
  pausarTemporizador,
  reanudarTemporizador,
  detenerTemporizador,
  alternarPausa,
  mostrarPantallaVolcado,
  mostrarPantallaFoco,
  mostrarPantallaHistorial,
  establecerTema,
  cargarTema,
  obtenerHistorial,
  guardarHistorial,
  dibujarEstadisticas,
  borrarHistorialHandler,
  obtenerSesionesPendientes,
  guardarSesionesPendientes,
  agregarSesionPendiente,
  marcarSesionCompletada,
  actualizarContadorPendientes,
  guardarPlantillaHandler,
  eliminarPlantillaHandler,
  cargarPlantillas,
  aplicarPlantillaPorIndice,
  seleccionarPreset,
  actualizarPresetActivo,
  establecerModoEstricto,
  cargarModoEstricto,
  iniciarSesionHandler,
  botonIniciar,
  botonSiguiente,
  botonHistorial,
  botonVolver,
  botonTema,
  botonEstricto,
  inputTarea,
  inputSubpaso,
  inputFocoMinutos,
  inputDescansoMinutos,
  presetButtons,
  mensajeError,
  botonPausa,
  botonInterrumpir,
  barraAvance,
  estadisticasHistorial,
  textoGranTarea,
  textoSubpaso,
  contenedorTiempo,
  mensajeFoco,
};
