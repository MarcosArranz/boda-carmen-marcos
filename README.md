# Boda Karmen y Marcos

Web de la boda: información del evento, itinerario, alojamiento, cuenta atrás y
galerías de fotos (fotógrafa, fotomatón, ONCE y analógicas).

## Estructura

```
index.html              Página principal
css/styles.css          Estilos
js/                     Scripts (galerías, carrusel, descargas, animaciones)
images/                 Fotos del carrusel
FOTOMATON/              Fotos del fotomatón
ONCE/                   Fotos de la fiesta de ONCE
FOTOGRAFA DEFINITIVO/   Fotos de la fotógrafa (solo derivados versionados)
ANALOGICA/              Fotos analógicas
tools/                  Utilidades (optimización de imágenes)
```

## Fotos: originales + versiones optimizadas

Las fotos originales pesan 1-4 MB cada una, demasiado para mostrarlas en una
cuadrícula. Por eso cada imagen tiene tres derivados:

| Derivado | Formato | Tamaño máx. | Uso | Peso típico |
|----------|---------|-------------|-----|-------------|
| `thumbs/` | WebP | 480 px | cuadrículas (miniaturas) | 15-20 KB |
| `large/` | WebP | 1600 px | carrusel y pantalla completa | 50-200 KB |
| `jpg/` | JPG | 1600 px | ZIP de descarga | 130-430 KB |

Estructura: `FOTOMATON/thumbs/<nombre>.webp` junto al original
`FOTOMATON/<nombre>.jpg` (igual en `ONCE/`, `FOTOGRAFA DEFINITIVO/` e `images/`).

**Al añadir fotos nuevas** hay que regenerar los derivados:

```bash
python tools/optimize-images.py          # solo procesa lo nuevo o modificado
python tools/optimize-images.py --force  # regenera todo
```

Para las galerías ONCE y Fotógrafa, además, hay que regenerar su listado de
fotos para que la web las muestre:

```bash
node tools/list_once_files.js
node tools/list_fotografia_files.js
```

Requiere Python con Pillow (`pip install pillow`). Los originales nunca se
modifican y, si falta un derivado, la web carga automáticamente el original.

> Importante: al publicar, sube también las carpetas `thumbs/`, `large/` y
> `jpg/`. Sin ellas la página sigue funcionando, pero cargando los archivos
> grandes.

En la galería de la Fotógrafa los **originales no se versionan** (3,15 GB):
`.gitignore` los excluye y el repositorio solo guarda los derivados (unos
520 MB). Los originales se consultan desde la carpeta de Google Drive enlazada
en la propia sección.

## Descargar todas las fotos

El botón «Descargar todas las fotos» de cada galería descarga los derivados
`jpg/` (JPG 1600 px, calidad 90) en un único ZIP: son las mismas fotos en JPG,
pero pesan menos que los originales (52 MB frente a 183 MB en Fotomatón, 139 MB
frente a 640 MB en ONCE, 340 MB frente a 3,2 GB en Fotógrafa y 9 MB frente a
14 MB en Analógicas), así que la descarga es bastante más rápida.

- Se piden 8 fotos en paralelo y el ZIP se crea sin recomprimir (STORE).
- JSZip solo se descarga al pulsar el botón.
- Si un derivado faltara, esa foto se descarga desde el original.
- Para una foto suelta se abre a pantalla completa y se usa su botón de
  descarga. En la Fotógrafa descarga el JPG 1600 px, porque los originales no
  están publicados; en el resto de galerías descarga el original.

En las galerías de Fotógrafa, Fotomatón, ONCE y Analógicas hay además un botón
con el icono de Google Drive que abre en una pestaña nueva la carpeta compartida
en Drive:

- Fotógrafa: `https://drive.google.com/drive/u/1/folders/1EDFrfiK0ZZBR0JQRH-wjmnjoNcZKWbTj`
- Fotomatón: `https://drive.google.com/drive/folders/1gCyfQvi8rvqftEQzFQNRsxYBGfLNpsya`
- ONCE: `https://drive.google.com/drive/folders/1S4ECepDiwBwwHeUbjnKLsizZyC5BH4E5`
- Analógicas: `https://drive.google.com/drive/folders/1_y9UIquKaiU5bJDyntmctahUvfQjEToX`

## Ir a una página concreta

Cada galería paginada (Fotomatón, ONCE, Fotógrafa y Analógicas) tiene, junto a las flechas
de navegación, un campo «Ir a» con su botón «Ir». Escribe el número de página y
pulsa «Ir» (o Intro) para saltar directamente a esas fotos.

- El número se ajusta siempre al rango válido: si pides la 73 en una galería de
  34 páginas, se muestra la 34.
- Si el campo se deja vacío, se mantiene la página actual.
- El campo se actualiza solo al usar las flechas o el salto de página.

## Publicación

El sitio se publica desde la rama `boda` del repositorio
`MarcosArranz/boda-carmen-marcos`.
