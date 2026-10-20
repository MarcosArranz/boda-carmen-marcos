# Boda Karmen y Marcos

Web de la boda: información del evento, itinerario, alojamiento, cuenta atrás y
galerías de fotos (carrusel, fotomatón y ONCE).

## Estructura

```
index.html          Página principal
css/styles.css      Estilos
js/                 Scripts (galerías, carrusel, descargas, animaciones)
images/             Fotos del carrusel
FOTOMATON/          Fotos del fotomatón
ONCE/               Fotos de la fiesta de ONCE
tools/              Utilidades (optimización de imágenes)
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
`FOTOMATON/<nombre>.jpg` (igual en `ONCE/` e `images/`).

**Al añadir fotos nuevas** hay que regenerar los derivados:

```bash
python tools/optimize-images.py          # solo procesa lo nuevo o modificado
python tools/optimize-images.py --force  # regenera todo
```

Requiere Python con Pillow (`pip install pillow`). Los originales nunca se
modifican y, si falta un derivado, la web carga automáticamente el original.

> Importante: al publicar, sube también las carpetas `thumbs/`, `large/` y
> `jpg/`. Sin ellas la página sigue funcionando, pero cargando los archivos
> grandes.

## Descargar todas las fotos

El botón «Descargar todas las fotos» de cada galería descarga los derivados
`jpg/` (JPG 1600 px, calidad 90) en un único ZIP: son las mismas fotos en JPG,
pero pesan menos que los originales (52 MB frente a 183 MB en Fotomatón, 139 MB
frente a 640 MB en ONCE), así que la descarga es bastante más rápida.

- Se piden 8 fotos en paralelo y el ZIP se crea sin recomprimir (STORE).
- JSZip solo se descarga al pulsar el botón.
- Si un derivado faltara, esa foto se descarga desde el original.
- Para una foto suelta en calidad original, se abre a pantalla completa y se
  usa su botón de descarga.

## Publicación

El sitio se publica desde la rama `boda` del repositorio
`MarcosArranz/boda-carmen-marcos`.
