// Descarga del pack completo de fotos en un ZIP.
// JSZip solo se descarga la primera vez que alguien pulsa el botón, no al cargar la página.
const JSZIP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
const DOWNLOAD_CONCURRENCY = 5;

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

async function downloadPhotoPack(packName, button) {
    const statusId = packName === 'fotomaton'
        ? 'fotomatonDownloadStatus'
        : 'onceDownloadStatus';
    const status = document.getElementById(statusId);
    const originalLabel = button.innerHTML;
    const photos = packName === 'fotomaton'
        ? window.fotomatonSlides
        : window.onceSlides;

    if (!Array.isArray(photos) || photos.length === 0) {
        if (status) status.textContent = 'No hay fotos disponibles para descargar.';
        return;
    }

    button.disabled = true;
    if (status) status.textContent = 'Preparando la descarga...';

    try {
        const JSZip = await loadJSZip();
        const zip = new JSZip();
        let completed = 0;

        // Varias descargas a la vez: mucho más rápido que una detrás de otra.
        let nextIndex = 0;
        const workerCount = Math.min(DOWNLOAD_CONCURRENCY, photos.length);
        const workers = Array.from({ length: workerCount }, async () => {
            while (nextIndex < photos.length) {
                const index = nextIndex++;
                const photoPath = photos[index];

                const response = await fetch(photoPath);
                if (!response.ok) {
                    throw new Error(`No se pudo descargar ${photoPath} (HTTP ${response.status}).`);
                }

                const photoData = await response.arrayBuffer();
                zip.file(photoPath.split('/').pop(), photoData, { binary: true });

                completed += 1;
                if (status) status.textContent = `Descargando fotos ${completed} de ${photos.length}...`;
            }
        });

        await Promise.all(workers);

        if (status) status.textContent = 'Creando ZIP...';
        const archiveBlob = await zip.generateAsync(
            { type: 'blob', compression: 'STORE' },
            (progress) => {
                if (status) status.textContent = `Creando ZIP: ${Math.round(progress.percent)}%...`;
            }
        );
        const downloadUrl = URL.createObjectURL(archiveBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = `${packName}-karmen-y-marcos.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        if (status) status.textContent = `ZIP descargado con ${photos.length} fotos.`;
    } catch (error) {
        if (status) status.textContent = error.message || 'No se pudo crear el ZIP.';
    } finally {
        button.disabled = false;
        button.innerHTML = originalLabel;
    }
}
