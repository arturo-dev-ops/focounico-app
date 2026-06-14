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
const mensajeError = document.getElementById('mensaje-error');
const botonPausa = document.getElementById('boton-pausa');
const barraAvance = document.getElementById('barra-avance');
const estadisticasHistorial = document.getElementById('estadisticas-historial');
const textoGranTarea = document.getElementById('texto-gran-tarea');
const textoSubpaso = document.getElementById('texto-subpaso');
const contenedorTiempo = document.getElementById('contenedor-tiempo');
const mensajeFoco = document.getElementById('mensaje-foco');

let intervalo;
let tiempoRestante = 20 * 60;
let focoMinutos = 20;
let descansoMinutos = 5;
let enDescanso = false;
let estaPausado = false;
let temaOscuro = false;
let historial = [];
let audioContext;

function formatearTiempo(segundos) {
  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
  const segundosRestantes = String(segundos % 60).padStart(2, '0');
  return `${minutos}:${segundosRestantes}`;
}

function obtenerConfiguracion() {
  const foco = parseInt(localStorage.getItem('focoMinutos'), 10);
  const descanso = parseInt(localStorage.getItem('descansoMinutos'), 10);

  focoMinutos = Number.isInteger(foco) && foco > 0 ? foco : 20;
  descansoMinutos = Number.isInteger(descanso) && descanso > 0 ? descanso : 5;

  inputFocoMinutos.value = focoMinutos;
  inputDescansoMinutos.value = descansoMinutos;
  actualizarPresetActivo();
}

function guardarConfiguracion() {
  const foco = parseInt(inputFocoMinutos.value, 10);
  const descanso = parseInt(inputDescansoMinutos.value, 10);

  focoMinutos = Number.isInteger(foco) && foco > 0 ? foco : 20;
  descansoMinutos = Number.isInteger(descanso) && descanso > 0 ? descanso : 5;

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
  if (!('Notification' in window) || Notification.permission !== 'default') {
    return;
  }

  Notification.requestPermission().then((perm) => {
    if (perm === 'granted') {
      console.log('Notificaciones habilitadas');
    }
  });
}

function mostrarNotificacion(tipo) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const titulo = tipo === 'foco' ? 'Foco completado' : 'Descanso terminado';
  const cuerpo = tipo === 'foco'
    ? 'Termina el ciclo y disfruta un pequeño descanso.'
    : 'Tu descanso ha terminado. Vuelve a concentrarte.';

  const notificacion = new Notification(titulo, {
    body: cuerpo,
    icon: 'assets/images/FocoUnico.png',
  });

  setTimeout(() => notificacion.close(), 5000);
}

function vibrar() {
  if (navigator.vibrate) {
    navigator.vibrate([120, 60, 120]);
  }
}

function establecerTema(oscuro) {
  temaOscuro = oscuro;
  document.body.classList.toggle('dark-mode', oscuro);
  botonTema.textContent = oscuro ? 'Tema claro' : 'Tema oscuro';
  localStorage.setItem('temaOscuro', oscuro ? '1' : '0');
}

function cargarTema() {
  const valorTema = localStorage.getItem('temaOscuro');
  establecerTema(valorTema === '1');
}

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

function alternarPausa() {
  if (!intervalo) {
    return;
  }

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
  localStorage.setItem('focoMinutos', focoMinutos);
  localStorage.setItem('descansoMinutos', descansoMinutos);
  localStorage.setItem('presetSeleccionado', `${focoMinutos}-${descansoMinutos}`);
  actualizarPresetActivo();
}

function actualizarPresetActivo() {
  presetButtons.forEach((button) => {
    const focoPreset = parseInt(button.dataset.foco, 10);
    const descansoPreset = parseInt(button.dataset.descanso, 10);
    const esActivo = focoPreset === focoMinutos && descansoPreset === descansoMinutos;
    button.classList.toggle('active', esActivo);
  });
}

function obtenerHistorial() {
  const contenido = localStorage.getItem('historialSesiones');
  try {
    historial = contenido ? JSON.parse(contenido) : [];
  } catch (error) {
    historial = [];
  }
}

function guardarHistorial() {
  localStorage.setItem('historialSesiones', JSON.stringify(historial));
}

function agregarHistorial(tarea, subpaso, foco, descanso, completado) {
  const registro = {
    fecha: new Date().toISOString(),
    tarea,
    subpaso,
    foco,
    descanso,
    completado,
  };

  historial.unshift(registro);
  if (historial.length > 10) {
    historial.pop();
  }
  guardarHistorial();
}

function mostrarPantallaHistorial() {
  pantallaVolcado.classList.add('oculto');
  pantallaFoco.classList.add('oculto');
  pantallaHistorial.classList.remove('oculto');
  dibujarHistorial();
}

function mostrarPantallaVolcado() {
  pantallaFoco.classList.add('oculto');
  pantallaHistorial.classList.add('oculto');
  pantallaVolcado.classList.remove('oculto');
  botonSiguiente.classList.add('oculto');
  botonPausa.classList.add('oculto');
  estaPausado = false;
  mensajeFoco.textContent = 'Mantente concentrado hasta que termine el tiempo.';
  document.body.classList.remove('descanso');
  tiempoRestante = focoMinutos * 60;
  contenedorTiempo.textContent = formatearTiempo(tiempoRestante);
  actualizarProgreso();
  clearInterval(intervalo);
}

function mostrarPantallaFoco() {
  pantallaVolcado.classList.add('oculto');
  pantallaHistorial.classList.add('oculto');
  pantallaFoco.classList.remove('oculto');
  botonPausa.classList.remove('oculto');
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

function iniciarTemporizador() {
  clearInterval(intervalo);
  estaPausado = false;
  botonPausa.textContent = 'Pausa';
  contenedorTiempo.textContent = formatearTiempo(tiempoRestante);
  actualizarProgreso();

  intervalo = setInterval(() => {
    tiempoRestante -= 1;
    contenedorTiempo.textContent = formatearTiempo(tiempoRestante);
    actualizarProgreso();

    if (tiempoRestante <= 0) {
      clearInterval(intervalo);
      if (!enDescanso) {
        reproducirSonido('foco');
        vibrar();
        mostrarNotificacion('foco');
        comenzarDescanso();
      } else {
        reproducirSonido('descanso');
        vibrar();
        mostrarNotificacion('descanso');
        finalizarDescanso();
        registrarSesion(true);
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
  const tareaValor = textoGranTarea.textContent;
  const subpasoValor = textoSubpaso.textContent;
  agregarHistorial(tareaValor, subpasoValor, focoMinutos, descansoMinutos, completado);
}

botonIniciar.addEventListener('click', () => {
  const tareaValor = inputTarea.value.trim();
  const subpasoValor = inputSubpaso.value.trim();

  if (!tareaValor || !subpasoValor) {
    alert('Por favor completa la gran tarea y el sub-paso antes de iniciar.');
    return;
  }

  solicitarPermisoNotificacion();
  guardarConfiguracion();
  tiempoRestante = focoMinutos * 60;
  textoGranTarea.textContent = tareaValor;
  textoSubpaso.textContent = subpasoValor;
  mostrarPantallaFoco();
  iniciarTemporizador();
});

botonSiguiente.addEventListener('click', mostrarPantallaVolcado);
botonHistorial.addEventListener('click', mostrarPantallaHistorial);
buttonTema.addEventListener('click', () => {
  establecerTema(!temaOscuro);
});
botonPausa.addEventListener('click', alternarPausa);
presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const foco = parseInt(button.dataset.foco, 10);
    const descanso = parseInt(button.dataset.descanso, 10);
    seleccionarPreset(foco, descanso);
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

botonVolver.addEventListener('click', () => {
  pantallaHistorial.classList.add('oculto');
  pantallaVolcado.classList.remove('oculto');
});

obtenerConfiguracion();
obtenerHistorial();
cargarTema();
