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

let fotomatonCurrentSlide = 0;
let fotomatonCurrentPage = 0;
const fotomatonPhotosPerPage = 12;
const fotomatonTotalPages = Math.ceil(fotomatonSlides.length / fotomatonPhotosPerPage);

function renderFotomatonPage() {
    const grid = document.getElementById('fotomatonGrid');
    const pageCounter = document.querySelector('.fotomaton-page-counter');
    if (!grid) return;

    const firstPhoto = fotomatonCurrentPage * fotomatonPhotosPerPage;
    const pagePhotos = fotomatonSlides.slice(firstPhoto, firstPhoto + fotomatonPhotosPerPage);
    grid.innerHTML = pagePhotos.map((src, pageIndex) => {
        const photoIndex = firstPhoto + pageIndex;
        const selectedClass = photoIndex === fotomatonCurrentSlide ? ' selected' : '';
        return `<button class="fotomaton-thumbnail${selectedClass}" onclick="selectFotomatonPhoto(${photoIndex})" title="Seleccionar foto ${photoIndex + 1}">
            <img src="${src}" alt="Foto del fotomatón ${photoIndex + 1}" loading="lazy">
        </button>`;
    }).join('');

    pageCounter.textContent = `Página ${fotomatonCurrentPage + 1} de ${fotomatonTotalPages}`;
}

function selectFotomatonPhoto(index) {
    fotomatonCurrentSlide = index;
    renderFotomatonPage();
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

function downloadFotomatonPhoto() {
    const imageUrl = fotomatonSlides[fotomatonCurrentSlide];
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = imageUrl.split('/').pop();
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}

function openFotomatonFullscreen() {
    const modal = document.getElementById('fotomatonFullscreenModal');
    const image = document.getElementById('fotomatonFullscreenImage');
    const counter = document.querySelector('.fotomaton-fullscreen-counter');

    image.src = fotomatonSlides[fotomatonCurrentSlide];
    counter.textContent = `${fotomatonCurrentSlide + 1} / ${fotomatonSlides.length}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFotomatonFullscreen() {
    document.getElementById('fotomatonFullscreenModal').classList.remove('active');
    document.body.style.overflow = '';
}

function updateFotomatonFullscreen() {
    document.getElementById('fotomatonFullscreenImage').src = fotomatonSlides[fotomatonCurrentSlide];
    document.querySelector('.fotomaton-fullscreen-counter').textContent =
        `${fotomatonCurrentSlide + 1} / ${fotomatonSlides.length}`;
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
    if (!modal.classList.contains('active')) return;

    if (event.key === 'ArrowLeft') prevFotomatonSlideFullscreen();
    if (event.key === 'ArrowRight') nextFotomatonSlideFullscreen();
    if (event.key === 'Escape') closeFotomatonFullscreen();
});
