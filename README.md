# FocoÚnico

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-online-brightgreen?style=flat-square&logo=github&logoColor=white)](https://arturo-dev-ops.github.io/focounico-app/)

FocoÚnico es una aplicación web ultra-simple para ayudar a estudiantes y profesionales a concentrarse en un solo sub-paso a la vez. La app combina temporizador de foco, descanso obligatorio y seguimiento sencillo con una interfaz limpia.

## 🚀 Características

- [x] Pantalla inicial para escribir una gran tarea y el sub-paso que vas a completar.
- [x] Permite elegir presets de tiempo: `20/5`, `25/5` y `45/15`.
- [x] Permite ajustar minutos de foco y descanso manualmente.
- [x] Temporizador de foco con barra de progreso visual.
- [x] Descanso automático al terminar el foco.
- [x] Botón de pausa / reanudar para detener y volver a iniciar el temporizador.
- [x] Modo oscuro con persistencia en `localStorage` y transición suave.
- [x] Historial de sesiones almacenado en `localStorage` con estadísticas básicas.
- [x] Guardar tareas frecuentes como plantillas reutilizables.
- [x] Modo estricto que bloquea edición y navegación durante la sesión.
- [x] Validación en pantalla para entradas incompletas.
- [x] Registro de tareas completadas vs pendientes con contador visual.
- [x] Notificaciones de navegador y sonido al terminar foco/descanso.
- [x] Teclas rápidas: Enter para iniciar, Space para pausar/reanudar.

## 📸 Capturas de pantalla

> *Próximamente: capturas de la interfaz en modo claro y oscuro.*
> Puedes ver la aplicación en vivo aquí: [https://arturo-dev-ops.github.io/focounico-app/](https://arturo-dev-ops.github.io/focounico-app/)

## 📁 Estructura del proyecto

```text
├── index.html              # Estructura HTML de la aplicación
├── README.md               # Documentación del proyecto
├── assets/
│   └── images/             # Recursos gráficos y favicon
├── docs/
│   ├── Ideas para mejorar FocoÚnico.txt
│   └── Planificacion_FocoUnico.txt
└── src/
    ├── css/
    │   └── styles.css      # Estilos y tema visual
    └── js/
        └── app.js          # Lógica del temporizador, persistencia y navegación
```

## 🧪 Uso rápido

1. Abre `index.html` en el navegador o visita la [versión online](https://arturo-dev-ops.github.io/focounico-app/).
2. Ingresa tu **Gran tarea** y el **Sub-paso**.
3. Elige un preset o ajusta los minutos de foco y descanso.
4. Haz clic en **Iniciar Foco** (o presiona `Enter`).
5. Usa **Pausa** para detener el temporizador o la tecla `Space` para alternar pausa.
6. Al terminar el foco se inicia el descanso automáticamente.
7. Al terminar el descanso, pulsa **Siguiente tarea** para volver al inicio.
8. Consulta el **historial** para ver sesiones completadas y estadísticas.
9. Revisa el contador de **tareas pendientes** para saber cuántas sesiones te quedan.

## ✨ Características principales

- Presets de tiempo útiles para productividad.
- Compatibilidad con almacenamiento local (`localStorage`).
- Interfaz de enfoque con cronómetro y barra de progreso.
- Pausa/reanuda sin perder el estado.
- Historial con conteo de sesiones y minutos totales.
- Tema oscuro con persistencia entre sesiones.
- Seguimiento de tareas completadas vs pendientes.
- Sonido y vibración al completar foco/descanso.
- Notificaciones de navegador (HTTPS requerido).
- Modo estricto para evitar distracciones.
- Plantillas de tareas frecuentes reutilizables.

## 🛠️ Tecnologías utilizadas

- **HTML5:** Estructura semántica para la aplicación.
- **CSS3:** Estilos responsivos, diseño limpio y variables personalizadas para el modo oscuro.
- **JavaScript (Vanilla):** Lógica del temporizador, gestión del estado y persistencia de datos.
- **LocalStorage API:** Persistencia de sesiones, configuración de tema y preferencias del usuario.
- **Web Audio API:** Sonidos de notificación al completar ciclos.
- **Notification API:** Notificaciones de navegador (cuando está en HTTPS).

## 🔮 Roadmap / Próximas mejoras

- [ ] Capturas de pantalla en la documentación (README).
- [ ] Limpieza de tareas pendientes completadas automáticamente.
- [ ] Estadísticas avanzadas (promedio de sesiones por día, racha actual).
- [ ] Exportar historial a CSV/JSON.
- [ ] Personalización de sonidos y volumen.
- [ ] Soporte para PWA (instalable en móvil/escritorio).

## 🛠️ Cómo contribuir

¡Las contribuciones son super bienvenidas! Si quieres mejorar FocoÚnico, sigue estos pasos:

1. Haz un **Fork** de este repositorio.
2. Crea una rama para tu mejora (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit con mensajes descriptivos (`git commit -m 'Añade nueva funcionalidad'`).
4. Sube la rama a tu repositorio (`git push origin feature/nueva-funcionalidad`).
5. Abre un **Pull Request** detallando tus cambios.

## 🌐 Despliegue en GitHub Pages

La aplicación está lista para publicarse como sitio estático. Para desplegar en GitHub Pages:

1. Asegúrate de tener el repo en GitHub bajo `https://github.com/arturo-dev-ops/focounico-app`.
3. En GitHub, ve a **Settings > Pages** y selecciona la rama `gh-pages` como fuente.
4. El sitio debería estar disponible en `https://arturo-dev-ops.github.io/focounico-app/`.
