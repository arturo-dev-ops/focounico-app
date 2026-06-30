import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatearTiempo,
  enteroPositivo,
  leerJSON,
  escribirJSON,
  obtenerConfiguracion,
  guardarConfiguracion,
  seleccionarPreset,
  establecerTema,
  establecerModoEstricto,
  agregarSesionPendiente,
  marcarSesionCompletada,
  actualizarContadorPendientes,
  guardarPlantillaHandler,
  eliminarPlantillaHandler,
} from '../src/js/app.js';

describe('Helpers', () => {
  describe('formatearTiempo', () => {
    it('formatea 0 segundos como 00:00', () => {
      expect(formatearTiempo(0)).toBe('00:00');
    });

    it('formatea min:seg con padding', () => {
      expect(formatearTiempo(65)).toBe('01:05');
      expect(formatearTiempo(599)).toBe('09:59');
      expect(formatearTiempo(3600)).toBe('60:00');
    });
  });

  describe('enteroPositivo', () => {
    it('devuelve el entero si es mayor a 0', () => {
      expect(enteroPositivo('5', 20)).toBe(5);
    });

    it('devuelve fallback si no es entero positivo', () => {
      expect(enteroPositivo('abc', 20)).toBe(20);
      expect(enteroPositivo(-3, 20)).toBe(20);
      expect(enteroPositivo(0, 20)).toBe(20);
      expect(enteroPositivo('', 20)).toBe(20);
    });
  });

  describe('leerJSON / escribirJSON', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('devuelve array vacío si no hay datos', () => {
      expect(leerJSON('x')).toEqual([]);
    });

    it('guarda y recupera un array', () => {
      const data = [{ id: 1, nombre: 'A' }];
      escribirJSON('key', data);
      expect(leerJSON('key')).toEqual(data);
    });

    it('devuelve fallback si el JSON está corrupto', () => {
      localStorage.setItem('key', '{invalido');
      expect(leerJSON('key')).toEqual([]);
    });
  });
});

describe('Configuración', () => {
  beforeEach(() => {
    localStorage.clear();
    document.getElementById('foco-minutos').value = 20;
    document.getElementById('descanso-minutos').value = 5;
  });

  it('carga minutos desde localStorage y actualiza inputs', () => {
    localStorage.setItem('focoMinutos', '30');
    localStorage.setItem('descansoMinutos', '10');
    obtenerConfiguracion();
    expect(document.getElementById('foco-minutos').value).toBe('30');
    expect(document.getElementById('descanso-minutos').value).toBe('10');
  });

  it('guarda minutos en inputs y localStorage', () => {
    document.getElementById('foco-minutos').value = 25;
    document.getElementById('descanso-minutos').value = 8;
    guardarConfiguracion();
    expect(document.getElementById('foco-minutos').value).toBe('25');
    expect(localStorage.getItem('focoMinutos')).toBe('25');
  });
});

describe('Presets', () => {
  beforeEach(() => {
    localStorage.clear();
    document.getElementById('foco-minutos').value = 20;
    document.getElementById('descanso-minutos').value = 5;
  });

  it('aplica preset y guarda selección si coincide', () => {
    seleccionarPreset(25, 5);
    expect(document.getElementById('foco-minutos').value).toBe('25');
    expect(localStorage.getItem('presetSeleccionado')).toBe('25-5');
  });

  it('no guarda preset para valores no coincidentes', () => {
    seleccionarPreset(30, 7);
    expect(document.getElementById('foco-minutos').value).toBe('30');
    expect(localStorage.getItem('presetSeleccionado')).toBeNull();
  });
});

describe('Temas', () => {
  beforeEach(() => {
    document.body.classList.remove('dark-mode');
  });

  it('activa dark mode en body', () => {
    establecerTema(true);
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });

  it('desactiva dark mode', () => {
    document.body.classList.add('dark-mode');
    establecerTema(false);
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });
});

describe('Modo estricto', () => {
  beforeEach(() => {
    document.body.classList.remove('modo-estricto');
    localStorage.removeItem('modoEstricto');
  });

  it('activa clase modo-estricto en body', () => {
    establecerModoEstricto(true);
    expect(document.body.classList.contains('modo-estricto')).toBe(true);
  });

  it('desactiva clase modo-estricto', () => {
    document.body.classList.add('modo-estricto');
    establecerModoEstricto(false);
    expect(document.body.classList.contains('modo-estricto')).toBe(false);
  });
});

describe('Pendientes', () => {
  beforeEach(() => {
    localStorage.removeItem('sesionesPendientes');
  });

  it('agrega una sesion pendiente con id, timestamp y completada=false', () => {
    agregarSesionPendiente('Tarea', 'Subpaso', 30);
    const pendientes = JSON.parse(localStorage.getItem('sesionesPendientes'));
    expect(pendientes).toHaveLength(1);
    expect(pendientes[0]).toMatchObject({
      tarea: 'Tarea',
      subpaso: 'Subpaso',
      completada: false,
    });
    expect(typeof pendientes[0].id).toBe('number');
    expect(typeof pendientes[0].fecha).toBe('string');
  });

  it('marca como completada por id y limpia las completadas', () => {
    agregarSesionPendiente('A', 'B', 10);
    agregarSesionPendiente('C', 'D', 20);
    const pendientes = JSON.parse(localStorage.getItem('sesionesPendientes'));
    const target = pendientes[0];
    marcarSesionCompletada(target.id);
    const updated = JSON.parse(localStorage.getItem('sesionesPendientes'));
    expect(updated).toHaveLength(1);
    expect(updated[0].completada).toBe(false);
    expect(updated[0].tarea).toBe('C');
  });

  it('actualiza contador visual de pendientes', () => {
    agregarSesionPendiente('A', 'B', 10);
    agregarSesionPendiente('C', 'D', 20);
    actualizarContadorPendientes();
    const el = document.querySelector('.pendientes-indicator');
    expect(el).toBeTruthy();
    expect(el.textContent).toContain('2');
  });
});

describe('Plantillas', () => {
  beforeEach(() => {
    localStorage.removeItem('plantillas');
  });

  it('guarda una plantilla nueva', () => {
    document.getElementById('tarea').value = 'Plantilla 1';
    document.getElementById('subpaso').value = 'SP1';
    guardarPlantillaHandler();
    const plantillas = JSON.parse(localStorage.getItem('plantillas'));
    expect(plantillas).toHaveLength(1);
    expect(plantillas[0]).toEqual({ tarea: 'Plantilla 1', subpaso: 'SP1' });
  });

  it('elimina plantilla por indice', () => {
    document.getElementById('tarea').value = 'A';
    document.getElementById('subpaso').value = 'a';
    guardarPlantillaHandler();
    document.getElementById('tarea').value = 'B';
    document.getElementById('subpaso').value = 'b';
    guardarPlantillaHandler();

    expect(JSON.parse(localStorage.getItem('plantillas'))).toHaveLength(2);
    eliminarPlantillaHandler();
    expect(JSON.parse(localStorage.getItem('plantillas'))).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem('plantillas'))[0].tarea).toBe('B');
  });
});
