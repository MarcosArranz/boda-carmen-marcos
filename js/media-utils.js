/**
 * Utilidades compartidas para servir imágenes optimizadas.
 *
 * Cada foto original tiene dos derivados generados con tools/optimize-images.py:
 *   foto.jpg  ->  thumbs/foto.webp  (miniatura ~20 KB)
 *                 large/foto.webp   (pantalla completa ~200 KB)
 *
 * Si un derivado no existe, las funciones de carga vuelven automáticamente al
 * original, de modo que la web nunca se queda sin mostrar una foto.
 */
(function (global) {
    'use strict';

    function toVariant(src, dir) {
        if (!src) return src;
        var slash = src.lastIndexOf('/');
        var folder = slash === -1 ? '' : src.slice(0, slash + 1);
        var file = src.slice(slash + 1);
        var dot = file.lastIndexOf('.');
        var base = dot === -1 ? file : file.slice(0, dot);
        return folder + dir + '/' + base + '.webp';
    }

    function thumb(src) {
        return toVariant(src, 'thumbs');
    }

    function large(src) {
        return toVariant(src, 'large');
    }

    /**
     * Carga `src` (versión optimizada) en un <img>, con vuelta atrás al
     * original si el derivado falla. Devuelve una promesa con true/false.
     */
    function loadInto(img, src, onReady) {
        if (!img || !src) return Promise.resolve(false);

        var optimized = large(src);
        var triedOriginal = optimized === src;

        return new Promise(function (resolve) {
            var settled = false;

            function finish(ok) {
                if (settled) return;
                settled = true;
                img.onload = null;
                img.onerror = null;
                if (ok && typeof onReady === 'function') onReady(img);
                resolve(ok);
            }

            img.onload = function () { finish(true); };
            img.onerror = function () {
                if (!triedOriginal) {
                    triedOriginal = true;
                    img.src = src;
                    return;
                }
                finish(false);
            };

            img.src = optimized;

            // Imagen ya en caché: el evento load puede haber pasado.
            if (img.complete && img.naturalWidth > 0) finish(true);
        });
    }

    var warmed = new Set();

    /**
     * Precarga discreta de las fotos que el usuario probablemente verá,
     * usando el tiempo libre del navegador.
     */
    function warm(urls) {
        if (!urls || !urls.length) return;

        var run = function () {
            urls.forEach(function (url) {
                if (!url || warmed.has(url)) return;
                warmed.add(url);
                var img = new Image();
                img.decoding = 'async';
                img.src = url;
            });
        };

        if ('requestIdleCallback' in global) {
            global.requestIdleCallback(run, { timeout: 1500 });
        } else {
            setTimeout(run, 200);
        }
    }

    /** Miniatura ya optimizada (sin comprobar) para pintar la cuadrícula. */
    function thumbUrl(src) {
        return thumb(src);
    }

    /** Imagen grande ya optimizada para el visor a pantalla completa. */
    function largeUrl(src) {
        return large(src);
    }

    global.MediaUtils = {
        thumb: thumb,
        large: large,
        thumbUrl: thumbUrl,
        largeUrl: largeUrl,
        loadInto: loadInto,
        warm: warm
    };
})(window);
