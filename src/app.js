const pantallaVolcado = document.getElementById('pantalla-volcado');
const pantallaFoco = document.getElementById('pantalla-foco');
const botonIniciar = document.getElementById('boton-iniciar');
const botonSiguiente = document.getElementById('boton-siguiente');
const inputTarea = document.getElementById('tarea');
const inputSubpaso = document.getElementById('subpaso');
const inputFocoMinutos = document.getElementById('foco-minutos');
const inputDescansoMinutos = document.getElementById('descanso-minutos');
const textoGranTarea = document.getElementById('texto-gran-tarea');
const textoSubpaso = document.getElementById('texto-subpaso');
const contenedorTiempo = document.getElementById('contenedor-tiempo');
const mensajeFoco = document.getElementById('mensaje-foco');

let intervalo;
let tiempoRestante = 20 * 60;
let focoMinutos = 20;
let descansoMinutos = 5;
let enDescanso = false;

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
}

function mostrarPantallaFoco() {
  pantallaVolcado.classList.add('oculto');
  pantallaFoco.classList.remove('oculto');
}

function mostrarPantallaVolcado() {
  pantallaFoco.classList.add('oculto');
  pantallaVolcado.classList.remove('oculto');
  botonSiguiente.classList.add('oculto');
  mensajeFoco.textContent = 'Mantente concentrado hasta que termine el tiempo.';
  document.body.classList.remove('descanso');
  tiempoRestante = focoMinutos * 60;
  contenedorTiempo.textContent = formatearTiempo(tiempoRestante);
  enDescanso = false;
  clearInterval(intervalo);
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

obtenerConfiguracion();
