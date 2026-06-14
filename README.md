# FocoÚnico

FocoÚnico es una aplicación web ultra-simple para ayudar a estudiantes y profesionales a concentrarse en un solo sub-paso a la vez. La app combina temporizador de foco, descanso obligatorio y seguimiento sencillo con una interfaz limpia.

## 🚀 Qué hace ahora

- Pantalla inicial para escribir una gran tarea y el sub-paso que vas a completar.
- Permite elegir presets de tiempo: `20/5`, `25/5` y `45/15`.
- Permite ajustar minutos de foco y descanso manualmente.
- Temporizador de foco con barra de progreso visual.
- Descanso automático al terminar el foco.
- Botón de pausa / reanudar para detener y volver a iniciar el temporizador.
- Modo oscuro que se guarda en `localStorage`.
- Historial de sesiones almacenado en `localStorage` con estadísticas básicas.
- Validación en pantalla para entradas incompletas.

## 📁 Estructura del proyecto

- `index.html` - estructura HTML de la aplicación.
- `src/styles.css` - estilos y tema visual.
- `src/app.js` - lógica del temporizador, persistencia y navegación.
- `assets/images/` - recursos gráficos y favicon.

## 🧪 Uso rápido

1. Abre `index.html` en el navegador.
2. Ingresa tu **Gran tarea** y el **Sub-paso**.
3. Elige un preset o ajusta los minutos de foco y descanso.
4. Haz clic en **Iniciar Foco**.
5. Usa **Pausa** para detener el temporizador o la tecla `Space` para alternar pausa.
6. Al terminar el foco se inicia el descanso automáticamente.
7. Al terminar el descanso, pulsa **Siguiente tarea** para volver al inicio.
8. Consulta el historial para ver sesiones completadas y estadísticas.

## ✨ Características principales

- Presets de tiempo útiles para productividad.
- Compatibilidad con almacenamiento local (`localStorage`).
- Interfaz de enfoque con cronómetro y barra de progreso.
- Pausa/reanuda sin perder el estado.
- Historial con conteo de sesiones y minutos totales.
- Tema oscuro con persistencia entre sesiones.

## 🛠️ Cómo contribuir

- Añadir notificaciones de navegador.
- Crear sonido o vibración al terminar foco y descanso.
- Mejorar la accesibilidad de entradas y botones.
- Añadir más presets o intervalos personalizables.
- Guardar tareas frecuentes y plantillas de sub-pasos.

## 📌 Nota

Este proyecto es una versión progresiva del MVP inicial. Ya incorpora ajustes de tiempo, historial y mejoras de experiencia, y puede seguir evolucionando con más funciones de productividad.
