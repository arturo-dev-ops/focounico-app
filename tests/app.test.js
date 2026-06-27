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
