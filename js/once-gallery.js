const oncePhotosPerPage = 12;
let onceCurrentSlide = 0;
let onceCurrentPage = 0;

function getOnceSlides() {
    return Array.isArray(window.onceSlides) ? window.onceSlides : [];
}

function renderOncePage() {
    const grid = document.getElementById('onceGrid');
    const pageCounter = document.querySelector('.once-page-counter');
    const onceSlides = getOnceSlides();
    if (!grid || onceSlides.length === 0) {
        if (grid) grid.innerHTML = '';
        if (pageCounter) pageCounter.textContent = 'Página 0 de 0';
        return;
    }

    const totalPages = Math.ceil(onceSlides.length / oncePhotosPerPage);
    const firstPhoto = onceCurrentPage * oncePhotosPerPage;
    const pagePhotos = onceSlides.slice(firstPhoto, firstPhoto + oncePhotosPerPage);

    grid.innerHTML = pagePhotos.map((src, pageIndex) => {
        const photoIndex = firstPhoto + pageIndex;
        const selectedClass = photoIndex === onceCurrentSlide ? ' selected' : '';
        return `<button class="fotomaton-thumbnail${selectedClass}" onclick="selectOncePhoto(${photoIndex})" title="Seleccionar foto ${photoIndex + 1}">
            <img src="${src}" alt="Foto de ONCE ${photoIndex + 1}" loading="lazy">
        </button>`;
    }).join('');

    pageCounter.textContent = `Página ${onceCurrentPage + 1} de ${totalPages}`;
}

function selectOncePhoto(index) {
    const onceSlides = getOnceSlides();
    if (!onceSlides.length) return;
    onceCurrentSlide = index;
    renderOncePage();
    openOnceFullscreen();
}

function nextOncePage() {
    const totalPages = Math.ceil(getOnceSlides().length / oncePhotosPerPage);
    if (!totalPages) return;
    onceCurrentPage = (onceCurrentPage + 1) % totalPages;
    renderOncePage();
}

function prevOncePage() {
    const totalPages = Math.ceil(getOnceSlides().length / oncePhotosPerPage);
    if (!totalPages) return;
    onceCurrentPage = (onceCurrentPage - 1 + totalPages) % totalPages;
    renderOncePage();
}

function downloadOncePhoto() {
    const onceSlides = getOnceSlides();
    if (!onceSlides.length) return;
    const imageUrl = onceSlides[onceCurrentSlide];
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = imageUrl.split('/').pop();
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}

function openOnceFullscreen() {
    const onceSlides = getOnceSlides();
    if (!onceSlides.length) return;
    const modal = document.getElementById('onceFullscreenModal');
    const image = document.getElementById('onceFullscreenImage');
    const counter = document.querySelector('.once-fullscreen-counter');

    image.src = onceSlides[onceCurrentSlide];
    counter.textContent = `${onceCurrentSlide + 1} / ${onceSlides.length}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOnceFullscreen() {
    const modal = document.getElementById('onceFullscreenModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateOnceFullscreen() {
    const onceSlides = getOnceSlides();
    if (!onceSlides.length) return;
    document.getElementById('onceFullscreenImage').src = onceSlides[onceCurrentSlide];
    document.querySelector('.once-fullscreen-counter').textContent = `${onceCurrentSlide + 1} / ${onceSlides.length}`;
}

function nextOnceSlideFullscreen() {
    const onceSlides = getOnceSlides();
    if (!onceSlides.length) return;
    onceCurrentSlide = (onceCurrentSlide + 1) % onceSlides.length;
    updateOnceFullscreen();
}

function prevOnceSlideFullscreen() {
    const onceSlides = getOnceSlides();
    if (!onceSlides.length) return;
    onceCurrentSlide = (onceCurrentSlide - 1 + onceSlides.length) % onceSlides.length;
    updateOnceFullscreen();
}

document.addEventListener('DOMContentLoaded', () => {
    renderOncePage();
    const modal = document.getElementById('onceFullscreenModal');
    if (!modal) return;
    document.addEventListener('keydown', (event) => {
        if (!modal.classList.contains('active')) return;
        if (event.key === 'ArrowLeft') prevOnceSlideFullscreen();
        if (event.key === 'ArrowRight') nextOnceSlideFullscreen();
        if (event.key === 'Escape') closeOnceFullscreen();
    });
});
