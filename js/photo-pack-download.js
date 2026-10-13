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
        status.textContent = 'No hay fotos disponibles para descargar.';
        return;
    }

    button.disabled = true;
    status.textContent = '';

    try {
        if (!window.JSZip) throw new Error('No se pudo cargar el creador de archivos ZIP.');

        const zip = new JSZip();
        for (let index = 0; index < photos.length; index += 1) {
            const photoPath = photos[index];
            status.textContent = `Descargando fotos ${index + 1} de ${photos.length}...`;

            const response = await fetch(photoPath);
            if (!response.ok) {
                throw new Error(`No se pudo descargar ${photoPath} (HTTP ${response.status}).`);
            }

            const photoData = await response.arrayBuffer();
            zip.file(photoPath.split('/').pop(), photoData, { binary: true });
        }

        status.textContent = 'Creando ZIP...';
        const archiveBlob = await zip.generateAsync(
            { type: 'blob', compression: 'STORE' },
            (progress) => {
                status.textContent = `Creando ZIP: ${Math.round(progress.percent)}%...`;
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
        status.textContent = `ZIP descargado con ${photos.length} fotos.`;
    } catch (error) {
        status.textContent = error.message || 'No se pudo crear el ZIP.';
    } finally {
        button.disabled = false;
        button.innerHTML = originalLabel;
    }
}