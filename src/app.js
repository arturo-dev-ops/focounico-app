const pantallaVolcado = document.getElementById('pantalla-volcado');
const pantallaFoco = document.getElementById('pantalla-foco');
const botonIniciar = document.getElementById('boton-iniciar');
const botonSiguiente = document.getElementById('boton-siguiente');
const inputTarea = document.getElementById('tarea');
const inputSubpaso = document.getElementById('subpaso');
const textoGranTarea = document.getElementById('texto-gran-tarea');
const textoSubpaso = document.getElementById('texto-subpaso');
const contenedorTiempo = document.getElementById('contenedor-tiempo');
const mensajeFoco = document.getElementById('mensaje-foco');

let intervalo;
let tiempoRestante = 20 * 60;
let enDescanso = false;

function formatearTiempo(segundos) {
  const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
  const segundosRestantes = String(segundos % 60).padStart(2, '0');
  return `${minutos}:${segundosRestantes}`;
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
  tiempoRestante = 20 * 60;
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
  tiempoRestante = 5 * 60;
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

  textoGranTarea.textContent = tareaValor;
  textoSubpaso.textContent = subpasoValor;
  mostrarPantallaFoco();
  iniciarTemporizador();
});

botonSiguiente.addEventListener('click', mostrarPantallaVolcado);
