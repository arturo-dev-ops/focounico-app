# FocoÚnico

FocoÚnico es una aplicación web ultra-simple para ayudar a estudiantes y profesionales a concentrarse en un solo sub-paso a la vez. La idea es reducir la ansiedad de las listas de tareas tradicionales y forzar una pausa obligatoria después de cada sesión de foco.

## 🚀 Qué hace

- Muestra una pantalla inicial para escribir una gran tarea y un sub-paso.
- Al iniciar, oculta la pantalla de volcado y muestra solo el sub-paso activo.
- Inicia una cuenta regresiva de foco de 20 minutos.
- Cuando el tiempo termina, fuerza un descanso de 5 minutos.
- Al terminar el descanso, aparece un botón para regresar a la pantalla de volcado.

## 📁 Estructura del proyecto

- `index.html` - estructura HTML de la aplicación.
- `styles.css` - estilos visuales relajantes y diseño centrado.
- `app.js` - lógica del temporizador, cambio de pantallas y estados.

## 🧪 Uso rápido

1. Abre `index.html` en el navegador.
2. Escribe tu **Gran tarea** y el **Sub-paso**.
3. Haz clic en **Iniciar Foco**.
4. Sigue el temporizador de 20 minutos.
5. Cuando termine, el sistema inicia un descanso de 5 minutos.
6. Al finalizar el descanso, pulsa **Siguiente tarea** para volver al inicio.

## ✨ Características principales

- Interfaz limpia y sin distracciones.
- Pantalla única por cada etapa: volcado, foco y descanso.
- Temporizador de foco 20 minutos + descanso de 5 minutos.
- Sin registro, sin base de datos y sin dependencias externas.

## 🛠️ Cómo contribuir

- Mejorar el diseño visual.
- Añadir validaciones más amigables.
- Guardar las tareas en `localStorage`.
- Permitir ajustar los tiempos de foco y descanso.
- Agregar sonido o notificaciones.

## 📌 Mejoras futuras

- Historial de sesiones completadas.
- Modo oscuro.
- Soporte móvil más avanzado.
- Guardar una lista de sub-pasos.
- Integrar un sistema de estadísticas de foco.

## 📌 Nota

Esta versión es un MVP pensado para avanzar rápido y comprobar el flujo básico: escribir tarea, iniciar foco, ver el cronómetro, descansar y volver a empezar.
