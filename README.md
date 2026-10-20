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
cuadrícula. Por eso cada imagen tiene dos derivados en WebP:

| Derivado | Tamaño máx. | Uso | Peso típico |
|----------|-------------|-----|-------------|
| `thumbs/` | 480 px | cuadrículas (miniaturas) | 15-20 KB |
| `large/` | 1600 px | carrusel y pantalla completa | 50-200 KB |

Estructura: `FOTOMATON/thumbs/<nombre>.webp` junto al original
`FOTOMATON/<nombre>.jpg` (igual en `ONCE/` e `images/`).

**Al añadir fotos nuevas** hay que regenerar los derivados:

```bash
python tools/optimize-images.py          # solo procesa lo nuevo o modificado
python tools/optimize-images.py --force  # regenera todo
```

Requiere Python con Pillow (`pip install pillow`). Los originales nunca se
modifican y, si falta un derivado, la web carga automáticamente el original.

> Importante: al publicar, sube también las carpetas `thumbs/` y `large/`.
> Sin ellas la página sigue funcionando, pero cargando los archivos grandes.

## Publicación

El sitio se publica desde la rama `boda` del repositorio
`MarcosArranz/boda-carmen-marcos`.
