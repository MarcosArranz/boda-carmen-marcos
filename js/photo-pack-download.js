async function addFotomatonArchive(zip, archivePath, photoNames, onProgress) {
    const response = await fetch(archivePath);
    if (!response.ok) throw new Error(`No se pudo leer ${archivePath}.`);

    const sourceZip = await JSZip.loadAsync(await response.arrayBuffer());
    for (const [archivePath, file] of Object.entries(sourceZip.files)) {
        const photoName = archivePath.split('/').pop();
        if (file.dir || !photoNames.has(photoName)) continue;

        const photoData = await file.async('uint8array');
        zip.file(photoName, photoData, { binary: true });
        onProgress(photoName);
    }
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
        status.textContent = 'No hay fotos disponibles para descargar.';
        return;
    }

    button.disabled = true;
    status.textContent = '';

    try {
        if (packName === 'once') {
            const downloadLink = document.createElement('a');
            downloadLink.href = 'ONCE/BODA-20260923T101224Z-1-001.zip';
            downloadLink.download = 'once-karmen-y-marcos.zip';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            status.textContent = `Descarga iniciada con ${photos.length} fotos.`;
            return;
        }

        if (!window.JSZip) throw new Error('No se pudo cargar el creador de archivos ZIP.');

        const zip = new JSZip();
        const photoNames = new Set(photos.map((photoPath) => photoPath.split('/').pop()));
        const archivePaths = [
            'FOTOMATON/miarchivo.zip',
            'FOTOMATON/miarchivo (1).zip',
            'FOTOMATON/miarchivo (2).zip'
        ];
        let processedPhotos = 0;

        for (let index = 0; index < archivePaths.length; index += 1) {
            status.textContent = `Preparando archivo ${index + 1} de ${archivePaths.length}...`;
            await addFotomatonArchive(zip, archivePaths[index], photoNames, () => {
                processedPhotos += 1;
                status.textContent = `Preparando fotos ${processedPhotos} de ${photos.length}...`;
            });
        }

        if (processedPhotos !== photos.length) throw new Error('No se han encontrado todas las fotos del pack.');

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