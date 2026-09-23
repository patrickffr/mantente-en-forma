# Mantente en forma

PWA instalable de un solo archivo (`index.html`) para llevar el conteo diario de
flexiones y sentadillas desde el iPhone, con historial diario/mensual y un
calendario visual de cumplimiento. Funciona 100% offline tras la primera carga
y no necesita build ni npm: es HTML + CSS + JS servidos tal cual.

## Archivos del proyecto

```
mantente-en-forma/
├── index.html        ← la app entera (HTML + CSS + JS inline, React vía UMD)
├── manifest.json      ← metadatos de la PWA (nombre, iconos, colores)
├── sw.js              ← service worker con estrategia cache-first
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
└── scripts/
    └── make_icons.py  ← script que generó los iconos (no hace falta subirlo)
```

## Desplegar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `mantente-en-forma`), público o privado.
2. Sube estos archivos a la raíz del repo (o a una carpeta `docs/`, lo que prefieras):
   - Desde tu ordenador: arrastra `index.html`, `manifest.json`, `sw.js` y la carpeta `icons/` a la web de GitHub ("Add file → Upload files"), o
   - Por línea de comandos:
     ```
     git init
     git add index.html manifest.json sw.js icons
     git commit -m "Primera versión de Mantente en forma"
     git branch -M main
     git remote add origin https://github.com/TU-USUARIO/mantente-en-forma.git
     git push -u origin main
     ```
3. En el repo, ve a **Settings → Pages**. En "Source" elige la rama `main` y la carpeta `/ (root)` (o `/docs` si subiste ahí). Guarda.
4. GitHub te dará una URL del tipo `https://TU-USUARIO.github.io/mantente-en-forma/`. Tarda uno o dos minutos en activarse la primera vez.

## Instalar en el iPhone

1. Abre esa URL en **Safari** (tiene que ser Safari, no el navegador interno de Instagram/Gmail/etc.).
2. Espera a que cargue una vez con conexión — así el service worker guarda todo en caché para el modo offline.
3. Sigue la guía que aparece dentro de la propia app la primera vez (o pulsa el icono "?" del encabezado para volver a verla): toca los **"•••"** de abajo a la derecha → **Compartir** → **Ver más** → **Añadir a pantalla de inicio**.
4. Abre la app desde el icono de la pantalla de inicio: se abrirá en modo pantalla completa (`standalone`), sin barra de Safari.

A partir de ahí puedes desconectar el wifi/datos y seguirá funcionando: todos los datos (repeticiones, historial) se guardan solo en el propio iPhone, con `localStorage` — no hay ningún servidor ni backend.

## Publicar una actualización más adelante

Si cambias `index.html`, `manifest.json` o los iconos y vuelves a subirlos al repo, el iPhone puede tardar en enterarse porque el service worker sirve todo desde caché. Para forzar que descargue la versión nueva:

1. Abre `sw.js` y sube el número de `CACHE_VERSION` (por ejemplo de `'v1'` a `'v2'`).
2. Sube ese cambio junto con el resto de archivos modificados.
3. La próxima vez que se abra la app con conexión, el service worker detectará la nueva versión, la descargará en segundo plano y borrará la caché antigua.

## Notas sobre los datos

- Todo se guarda en `localStorage` bajo la clave `mantenteEnForma_v1`, como un único objeto JSON con los registros por día (`{"2026-09-24": {"flexiones": 25, "sentadillas": 40}}`).
- Los totales mensuales y las marcas ✔/✗ del calendario se calculan a partir de esos registros diarios, no se guardan por separado.
- Si borras los datos de sitio web de Safari para este dominio, o desinstalas y reinstalas la app, se pierde el historial (vive solo en ese iPhone). No hay copia de seguridad en la nube: si quieres eso más adelante, se puede añadir una exportación/importación manual de los datos en JSON.
