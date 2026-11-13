# Nuestro jardín — Maryore y Brayan

Regalo interactivo para el 13 de noviembre, con lirios, ocho cartas, álbum, torta, canción y transición de libro.

## Abrir el proyecto

Con Node.js instalado, abre una terminal en esta carpeta y ejecuta:

```text
node preview.mjs
```

Luego entra a http://127.0.0.1:4173 en tu navegador. También puedes abrir dist/index.html directamente; para guardar fotos y evitar diferencias entre navegadores, se recomienda el servidor local.

No requiere instalar dependencias. Los tipos de letra de Google Fonts necesitan internet; si no hay conexión, utiliza las fuentes de respaldo del dispositivo. El MP3 y el jardín están incluidos.

## Recorrido

- El formulario siempre permite entrar, incluso con campos vacíos o cualquier respuesta. Las respuestas no se envían ni se guardan.
- La canción empieza con el clic en Entrar; si el navegador impide reproducirla, pulsa Nuestra canción. Se puede pausar y continúa al navegar entre secciones.
- Las secciones cambian con un efecto de página. Se respeta la preferencia del dispositivo de reducir movimiento.
- Ocho cartas con progreso de lectura guardado en este navegador.
- Álbum con foto, título y descripción. En celular muestra una página a la vez; en pantallas grandes muestra dos.
- Torta con cinco velas decorativas (no representan la edad), confeti y dedicatoria.

## Personalizar

Los textos iniciales de las cartas son borradores para revisar con Brayan. El único encuentro específico incluido es el confirmado: la quinceañera de Maryore. No se inventaron fotos de la pareja; el álbum muestra espacios pendientes.

Desde el jardín pulsa **Preparar el regalo**, o abre la dirección con `?preparar=1`. Puedes añadir fotos con título y descripción, cambiar los recuerdos existentes, editar las ocho cartas y la dedicatoria.

**Los cambios se guardan solo en ese navegador mediante IndexedDB. No se sincronizan con otros celulares ni con la versión publicada.** Exportar copia genera un JSON con fotos y textos que puedes importar en otro dispositivo. Descargar content.js genera el contenido para incluirlo permanentemente en el proyecto: reemplaza dist/content.js por el archivo descargado y vuelve a publicar. También puedes enviárselo a quien te ayude a actualizar el proyecto.

Para personalizar manualmente, edita dist/content.js. Pon las fotos en dist/assets y usa rutas como `assets/foto-01.jpg`. Puedes añadir o quitar recuerdos; se necesitan exactamente ocho cartas.

El modo de preparación no tiene contraseña: edita datos locales, no un servidor. No hay cuentas ni base de datos compartida. El formulario de entrada es parte del regalo, no un control de acceso.

## Publicación

La carpeta dist es un sitio estático y contiene todos los archivos para alojar la experiencia. La configuración de Sites está en .openai/hosting.json. La publicación inicial de Sites es privada del propietario; eso no da acceso automáticamente a Maryore. Para enviarle un enlace accesible se debe configurar el público adecuado en el alojamiento.

## Archivos

- dist/index.html: estructura y reproductor persistente.
- dist/style.css: interfaz, móvil, torta y animaciones.
- dist/app.js: navegación, cartas, álbum, guardado local y edición.
- dist/content.js: textos y fotos personalizables.
- dist/assets/jardin.png: fondo generado a partir de la maqueta aprobada.
- dist/assets/nuestra-cancion.mp3: archivo de Río Roma proporcionado por Brayan.
- preview.mjs: servidor local con soporte de reproducción por rangos.

El fondo se generó con la herramienta integrada de imágenes. Prompt final: conservar el jardín nocturno aprobado, su lirio iluminado, estanque, sobres, álbum y torta; eliminar todo texto, panel, botón y control, y dejar las páginas del álbum en blanco para usarlas como fondo de la aplicación.
