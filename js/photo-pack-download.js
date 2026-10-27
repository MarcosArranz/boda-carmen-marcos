// Descarga del pack completo de fotos en un ZIP.
//
// Claves de velocidad:
//  - Se descargan los JPG optimizados (jpg/*.jpg, 1600 px): son las mismas fotos
//    en JPG, pero pesan ~5 veces menos que los originales (Fotomatón, ONCE y
//    Fotógrafa).
//  - Varias descargas en paralelo (HTTP/2 multiplexa sin problema).
//  - ZIP sin compresión (STORE): un JPG ya está comprimido, así que comprimir
//    otra vez solo gastaría CPU.
//  - JSZip se carga la primera vez que se pulsa el botón, no al abrir la página.
const JSZIP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
const DOWNLOAD_CONCURRENCY = 8;
const DOWNLOAD_ATTEMPTS = 2;
const RETRY_DELAY = 500;

// Cada galería indica dónde están sus fotos y su mensaje de estado.
const PHOTO_PACKS = {
    fotomaton: { statusId: 'fotomatonDownloadStatus', slides: 'fotomatonSlides' },
    once: { statusId: 'onceDownloadStatus', slides: 'onceSlides' },
    fotografia: { statusId: 'fotografiaDownloadStatus', slides: 'fotografiaSlides' }
};

let jszipRequest = null;

function loadJSZip() {
    if (window.JSZip) return Promise.resolve(window.JSZip);
    if (!jszipRequest) {
        jszipRequest = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = JSZIP_URL;
            script.async = true;
            script.onload = () => {
                if (window.JSZip) resolve(window.JSZip);
                else reject(new Error('No se pudo cargar el creador de archivos ZIP.'));
            };
            script.onerror = () => reject(new Error('No se pudo cargar el creador de archivos ZIP.'));
            document.head.appendChild(script);
        });
    }
    return jszipRequest;
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

/**
 * Cada foto se pide primero en versión JPG optimizada (jpg/, 1600 px). Si ese
 * derivado no existiera (por ejemplo, una foto añadida sin regenerar), se usa
 * el original.
 */
function buildEntries(photos) {
    return photos.map((src) => {
        const optimized = window.MediaUtils ? MediaUtils.jpgUrl(src) : src;
        return {
            src,
            url: optimized,
            name: optimized.split('/').pop()
        };
    });
}

async function fetchPhoto(entry) {
    const candidates = [{ url: entry.url, name: entry.name }];
    if (entry.url !== entry.src) {
        candidates.push({ url: entry.src, name: entry.src.split('/').pop() });
    }

    let lastError = null;

    for (const candidate of candidates) {
        for (let attempt = 0; attempt < DOWNLOAD_ATTEMPTS; attempt += 1) {
            try {
                const response = await fetch(candidate.url);
                if (!response.ok) break; // 404: este formato no existe, probamos el siguiente
                return { name: candidate.name, blob: await response.blob() };
            } catch (error) {
                lastError = error;
                if (attempt + 1 < DOWNLOAD_ATTEMPTS) await wait(RETRY_DELAY);
            }
        }
    }

    throw lastError || new Error(`No se pudo descargar ${entry.src}`);
}

function getProgressBar(button) {
    const wrapper = button.closest('.photo-pack-download');
    if (!wrapper) return null;

    let progress = wrapper.querySelector('.photo-pack-progress');
    if (!progress) {
        progress = document.createElement('div');
        progress.className = 'photo-pack-progress';
        progress.innerHTML = '<div class="photo-pack-progress-bar"></div>';
        const status = wrapper.querySelector('.photo-pack-status');
        wrapper.insertBefore(progress, status);
    }

    progress.hidden = false;
    return progress.firstElementChild;
}

function hideProgress(button) {
    const wrapper = button.closest('.photo-pack-download');
    const progress = wrapper ? wrapper.querySelector('.photo-pack-progress') : null;
    if (!progress) return;
    progress.hidden = true;
    progress.firstElementChild.style.width = '0%';
}

async function downloadPhotoPack(packName, button) {
    if (button && button.disabled) return;

    const pack = PHOTO_PACKS[packName];
    const status = pack ? document.getElementById(pack.statusId) : null;
    const photos = pack ? window[pack.slides] : null;

    if (!Array.isArray(photos) || photos.length === 0) {
        if (status) status.textContent = 'No hay fotos disponibles para descargar.';
        return;
    }

    const originalLabel = button ? button.innerHTML : '';
    if (button) {
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
    }

    const bar = button ? getProgressBar(button) : null;
    const entries = buildEntries(photos);
    const total = entries.length;

    let completed = 0;
    let downloadedBytes = 0;
    let nextIndex = 0;
    const failures = [];

    const paintProgress = (label) => {
        if (bar) bar.style.width = `${Math.round((completed / total) * 100)}%`;
        if (status) status.textContent = label;
    };

    try {
        paintProgress(`Preparando ${total} fotos...`);
        const JSZip = await loadJSZip();
        const zip = new JSZip();

        const workerCount = Math.min(DOWNLOAD_CONCURRENCY, total);

        const workers = Array.from({ length: workerCount }, async () => {
            while (nextIndex < total) {
                const entry = entries[nextIndex];
                nextIndex += 1;

                try {
                    const photo = await fetchPhoto(entry);
                    zip.file(photo.name, photo.blob, { binary: true });
                    downloadedBytes += photo.blob.size;
                } catch (error) {
                    failures.push(entry.src);
                }

                completed += 1;
                paintProgress(`Descargando ${completed} de ${total} · ${formatSize(downloadedBytes)}`);
            }
        });

        await Promise.all(workers);

        if (completed === failures.length) {
            throw new Error('No se pudo descargar ninguna foto. Comprueba tu conexión.');
        }

        if (bar) bar.style.width = '100%';
        if (status) status.textContent = `Creando ZIP (${formatSize(downloadedBytes)})...`;

        const archiveBlob = await zip.generateAsync(
            { type: 'blob', compression: 'STORE' },
            (progress) => {
                if (status) status.textContent = `Creando ZIP: ${Math.round(progress.percent)}%`;
            }
        );

        const downloadUrl = URL.createObjectURL(archiveBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = `${packName}-karmen-y-marcos.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);

        const skipped = failures.length
            ? ` (${failures.length} no se pudieron descargar)`
            : '';
        if (status) {
            status.textContent = `ZIP listo: ${total - failures.length} fotos · ${formatSize(downloadedBytes)}${skipped}`;
        }
    } catch (error) {
        if (status) status.textContent = error.message || 'No se pudo crear el ZIP.';
    } finally {
        if (button) {
            button.disabled = false;
            button.removeAttribute('aria-busy');
            button.innerHTML = originalLabel;
            hideProgress(button);
        }
    }
}
