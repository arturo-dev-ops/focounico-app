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
const textoGranTarea = document.getElementById('texto-gran-tarea');
const textoSubpaso = document.getElementById('texto-subpaso');
const contenedorTiempo = document.getElementById('contenedor-tiempo');
const mensajeFoco = document.getElementById('mensaje-foco');

let intervalo;
let tiempoRestante = 20 * 60;
let focoMinutos = 20;
let descansoMinutos = 5;
let enDescanso = false;
let historial = [];

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
  mensajeFoco.textContent = 'Mantente concentrado hasta que termine el tiempo.';
  document.body.classList.remove('descanso');
  tiempoRestante = focoMinutos * 60;
  contenedorTiempo.textContent = formatearTiempo(tiempoRestante);
  enDescanso = false;
  clearInterval(intervalo);
}

function mostrarPantallaFoco() {
  pantallaVolcado.classList.add('oculto');
  pantallaHistorial.classList.add('oculto');
  pantallaFoco.classList.remove('oculto');
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
  contenedorTiempo.textContent = formatearTiempo(tiempoRestante);
  intervalo = setInterval(() => {
    tiempoRestante -= 1;
    contenedorTiempo.textContent = formatearTiempo(tiempoRestante);

    if (tiempoRestante <= 0) {
      clearInterval(intervalo);
      if (!enDescanso) {
        comenzarDescanso();
      } else {
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

  guardarConfiguracion();
  tiempoRestante = focoMinutos * 60;
  textoGranTarea.textContent = tareaValor;
  textoSubpaso.textContent = subpasoValor;
  mostrarPantallaFoco();
  iniciarTemporizador();
});

botonSiguiente.addEventListener('click', mostrarPantallaVolcado);
botonHistorial.addEventListener('click', mostrarPantallaHistorial);
presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const foco = parseInt(button.dataset.foco, 10);
    const descanso = parseInt(button.dataset.descanso, 10);
    seleccionarPreset(foco, descanso);
  });
});
botonVolver.addEventListener('click', () => {
  pantallaHistorial.classList.add('oculto');
  pantallaVolcado.classList.remove('oculto');
});

obtenerConfiguracion();
obtenerHistorial();
