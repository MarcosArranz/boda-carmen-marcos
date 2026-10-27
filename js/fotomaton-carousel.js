const fotomatonMissingNumbers = new Set([589, 591, 607, 608]);

const fotomatonSlides = [
    'FOTOMATON/22961-GaleriaCliente834135.jpg',
    ...Array.from({ length: 410 }, (_, index) =>
        `FOTOMATON/22961-GaleriaCliente${834251 + index}.jpg`
    )
].filter((src) => {
    const match = src.match(/834(\d+)\.jpg$/);
    return !match || !fotomatonMissingNumbers.has(Number(match[1]));
});
window.fotomatonSlides = fotomatonSlides;

const fotomatonPhotosPerPage = 12;
const fotomatonTotalPages = Math.ceil(fotomatonSlides.length / fotomatonPhotosPerPage);

let fotomatonCurrentSlide = 0;
let fotomatonCurrentPage = 0;

function fotomatonPageStart(page) {
    return page * fotomatonPhotosPerPage;
}

function renderFotomatonPage() {
    const grid = document.getElementById('fotomatonGrid');
    const pageCounter = document.querySelector('.fotomaton-page-counter');
    if (!grid) return;

    const firstPhoto = fotomatonPageStart(fotomatonCurrentPage);
    const pagePhotos = fotomatonSlides.slice(firstPhoto, firstPhoto + fotomatonPhotosPerPage);

    grid.innerHTML = pagePhotos.map((src, pageIndex) => {
        const photoIndex = firstPhoto + pageIndex;
        const selectedClass = photoIndex === fotomatonCurrentSlide ? ' selected' : '';
        return `<button class="fotomaton-thumbnail${selectedClass}" type="button" onclick="selectFotomatonPhoto(${photoIndex})" title="Seleccionar foto ${photoIndex + 1}">
            <img src="${MediaUtils.thumbUrl(src)}" alt="Foto del fotomatón ${photoIndex + 1}" loading="lazy" decoding="async" width="480" height="480" data-original="${src}">
        </button>`;
    }).join('');

    // Si la miniatura optimizada faltara, usamos el original.
    grid.querySelectorAll('img[data-original]').forEach((img) => {
        img.addEventListener('error', function onError() {
            img.removeEventListener('error', onError);
            img.src = img.dataset.original;
        });
    });

    if (pageCounter) {
        pageCounter.textContent = `Página ${fotomatonCurrentPage + 1} de ${fotomatonTotalPages}`;
    }

    const pageInput = document.getElementById('fotomatonPageInput');
    if (pageInput) {
        pageInput.max = String(fotomatonTotalPages);
        pageInput.value = String(fotomatonCurrentPage + 1);
    }

    warmFotomatonPage(fotomatonCurrentPage + 1);
    warmFotomatonPage(fotomatonCurrentPage - 1);
}

function warmFotomatonPage(page) {
    if (page < 0 || page >= fotomatonTotalPages) return;
    const firstPhoto = fotomatonPageStart(page);
    const urls = fotomatonSlides
        .slice(firstPhoto, firstPhoto + fotomatonPhotosPerPage)
        .map((src) => MediaUtils.thumbUrl(src));
    MediaUtils.warm(urls);
}

function selectFotomatonPhoto(index) {
    fotomatonCurrentSlide = index;
    document.querySelectorAll('#fotomatonGrid .fotomaton-thumbnail').forEach((thumbnail, pageIndex) => {
        const photoIndex = fotomatonPageStart(fotomatonCurrentPage) + pageIndex;
        thumbnail.classList.toggle('selected', photoIndex === index);
    });
    openFotomatonFullscreen();
}

function nextFotomatonPage() {
    fotomatonCurrentPage = (fotomatonCurrentPage + 1) % fotomatonTotalPages;
    renderFotomatonPage();
}

function prevFotomatonPage() {
    fotomatonCurrentPage = (fotomatonCurrentPage - 1 + fotomatonTotalPages) % fotomatonTotalPages;
    renderFotomatonPage();
}

function jumpToFotomatonPage(event) {
    if (event) event.preventDefault();

    const input = document.getElementById('fotomatonPageInput');
    if (!input || !fotomatonTotalPages) return;

    const requested = Number.parseInt(input.value, 10);
    const page = Number.isFinite(requested)
        ? Math.min(Math.max(requested, 1), fotomatonTotalPages)
        : fotomatonCurrentPage + 1;

    fotomatonCurrentPage = page - 1;
    renderFotomatonPage();
}

function downloadFotomatonPhoto() {
    const imageUrl = fotomatonSlides[fotomatonCurrentSlide];
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = imageUrl.split('/').pop();
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}

function updateFotomatonFullscreen() {
    const image = document.getElementById('fotomatonFullscreenImage');
    const counter = document.querySelector('.fotomaton-fullscreen-counter');
    if (!image) return;

    image.classList.add('is-loading');
    MediaUtils.loadInto(image, fotomatonSlides[fotomatonCurrentSlide], (el) => el.classList.remove('is-loading'));

    if (counter) {
        counter.textContent = `${fotomatonCurrentSlide + 1} / ${fotomatonSlides.length}`;
    }

    const total = fotomatonSlides.length;
    const urls = [1, -1].map((offset) =>
        MediaUtils.largeUrl(fotomatonSlides[(fotomatonCurrentSlide + offset + total) % total])
    );
    MediaUtils.warm(urls);
}

function openFotomatonFullscreen() {
    const modal = document.getElementById('fotomatonFullscreenModal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateFotomatonFullscreen();
}

function closeFotomatonFullscreen() {
    const modal = document.getElementById('fotomatonFullscreenModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function nextFotomatonSlideFullscreen() {
    fotomatonCurrentSlide = (fotomatonCurrentSlide + 1) % fotomatonSlides.length;
    updateFotomatonFullscreen();
}

function prevFotomatonSlideFullscreen() {
    fotomatonCurrentSlide = (fotomatonCurrentSlide - 1 + fotomatonSlides.length) % fotomatonSlides.length;
    updateFotomatonFullscreen();
}

document.addEventListener('DOMContentLoaded', renderFotomatonPage);

document.addEventListener('keydown', (event) => {
    const modal = document.getElementById('fotomatonFullscreenModal');
    if (!modal || !modal.classList.contains('active')) return;

    if (event.key === 'ArrowLeft') prevFotomatonSlideFullscreen();
    if (event.key === 'ArrowRight') nextFotomatonSlideFullscreen();
    if (event.key === 'Escape') closeFotomatonFullscreen();
});
