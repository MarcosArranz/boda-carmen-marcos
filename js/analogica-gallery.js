const analogicaPhotosPerPage = 12;
let analogicaCurrentSlide = 0;
let analogicaCurrentPage = 0;

function getAnalogicaSlides() {
    return Array.isArray(window.analogicaSlides) ? window.analogicaSlides : [];
}

function analogicaPageStart(page) {
    return page * analogicaPhotosPerPage;
}

function renderAnalogicaPage() {
    const grid = document.getElementById('analogicaGrid');
    const pageCounter = document.querySelector('.analogica-page-counter');
    const analogicaSlides = getAnalogicaSlides();

    if (!grid) return;
    if (analogicaSlides.length === 0) {
        grid.innerHTML = '';
        if (pageCounter) pageCounter.textContent = 'Página 0 de 0';
        return;
    }

    const totalPages = Math.ceil(analogicaSlides.length / analogicaPhotosPerPage);
    const firstPhoto = analogicaPageStart(analogicaCurrentPage);
    const pagePhotos = analogicaSlides.slice(firstPhoto, firstPhoto + analogicaPhotosPerPage);

    grid.innerHTML = pagePhotos.map((src, pageIndex) => {
        const photoIndex = firstPhoto + pageIndex;
        const selectedClass = photoIndex === analogicaCurrentSlide ? ' selected' : '';
        return `<button class="fotomaton-thumbnail${selectedClass}" type="button" onclick="selectAnalogicaPhoto(${photoIndex})" title="Seleccionar foto ${photoIndex + 1}">
            <img src="${MediaUtils.thumbUrl(src)}" alt="Foto analógica ${photoIndex + 1}" loading="lazy" decoding="async" width="480" height="480" data-original="${src}">
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
        pageCounter.textContent = `Página ${analogicaCurrentPage + 1} de ${totalPages}`;
    }

    const pageInput = document.getElementById('analogicaPageInput');
    if (pageInput) {
        pageInput.max = String(totalPages);
        pageInput.value = String(analogicaCurrentPage + 1);
    }

    warmAnalogicaPage(analogicaCurrentPage + 1);
    warmAnalogicaPage(analogicaCurrentPage - 1);
}

function warmAnalogicaPage(page) {
    const analogicaSlides = getAnalogicaSlides();
    const totalPages = Math.ceil(analogicaSlides.length / analogicaPhotosPerPage);
    if (page < 0 || page >= totalPages) return;

    const firstPhoto = analogicaPageStart(page);
    const urls = analogicaSlides
        .slice(firstPhoto, firstPhoto + analogicaPhotosPerPage)
        .map((src) => MediaUtils.thumbUrl(src));

    MediaUtils.warm(urls);
}

function selectAnalogicaPhoto(index) {
    const analogicaSlides = getAnalogicaSlides();
    if (!analogicaSlides.length) return;

    analogicaCurrentSlide = index;
    document.querySelectorAll('#analogicaGrid .fotomaton-thumbnail').forEach((thumbnail, pageIndex) => {
        const photoIndex = analogicaPageStart(analogicaCurrentPage) + pageIndex;
        thumbnail.classList.toggle('selected', photoIndex === index);
    });
    openAnalogicaFullscreen();
}

function nextAnalogicaPage() {
    const totalPages = Math.ceil(getAnalogicaSlides().length / analogicaPhotosPerPage);
    if (!totalPages) return;
    analogicaCurrentPage = (analogicaCurrentPage + 1) % totalPages;
    renderAnalogicaPage();
}

function prevAnalogicaPage() {
    const totalPages = Math.ceil(getAnalogicaSlides().length / analogicaPhotosPerPage);
    if (!totalPages) return;
    analogicaCurrentPage = (analogicaCurrentPage - 1 + totalPages) % totalPages;
    renderAnalogicaPage();
}

function jumpToAnalogicaPage(event) {
    if (event) event.preventDefault();

    const input = document.getElementById('analogicaPageInput');
    const totalPages = Math.ceil(getAnalogicaSlides().length / analogicaPhotosPerPage);
    if (!input || !totalPages) return;

    const requested = Number.parseInt(input.value, 10);
    const page = Number.isFinite(requested)
        ? Math.min(Math.max(requested, 1), totalPages)
        : analogicaCurrentPage + 1;

    analogicaCurrentPage = page - 1;
    renderAnalogicaPage();
}

function downloadAnalogicaPhoto() {
    const analogicaSlides = getAnalogicaSlides();
    if (!analogicaSlides.length) return;
    const original = analogicaSlides[analogicaCurrentSlide];
    // Descargamos el JPG 1600 px, igual que el resto de galerías.
    const imageUrl = window.MediaUtils ? window.MediaUtils.jpgUrl(original) : original;
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = imageUrl.split('/').pop();
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}

function updateAnalogicaFullscreen() {
    const analogicaSlides = getAnalogicaSlides();
    if (!analogicaSlides.length) return;

    const image = document.getElementById('analogicaFullscreenImage');
    const counter = document.querySelector('.analogica-fullscreen-counter');
    if (!image) return;

    image.classList.add('is-loading');
    MediaUtils.loadInto(image, analogicaSlides[analogicaCurrentSlide], (el) => el.classList.remove('is-loading'));

    if (counter) {
        counter.textContent = `${analogicaCurrentSlide + 1} / ${analogicaSlides.length}`;
    }

    const total = analogicaSlides.length;
    const urls = [1, -1].map((offset) =>
        MediaUtils.largeUrl(analogicaSlides[(analogicaCurrentSlide + offset + total) % total])
    );
    MediaUtils.warm(urls);
}

function openAnalogicaFullscreen() {
    const analogicaSlides = getAnalogicaSlides();
    if (!analogicaSlides.length) return;

    const modal = document.getElementById('analogicaFullscreenModal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateAnalogicaFullscreen();
}

function closeAnalogicaFullscreen() {
    const modal = document.getElementById('analogicaFullscreenModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function nextAnalogicaSlideFullscreen() {
    const analogicaSlides = getAnalogicaSlides();
    if (!analogicaSlides.length) return;
    analogicaCurrentSlide = (analogicaCurrentSlide + 1) % analogicaSlides.length;
    updateAnalogicaFullscreen();
}

function prevAnalogicaSlideFullscreen() {
    const analogicaSlides = getAnalogicaSlides();
    if (!analogicaSlides.length) return;
    analogicaCurrentSlide = (analogicaCurrentSlide - 1 + analogicaSlides.length) % analogicaSlides.length;
    updateAnalogicaFullscreen();
}

document.addEventListener('DOMContentLoaded', () => {
    renderAnalogicaPage();
    const modal = document.getElementById('analogicaFullscreenModal');
    if (!modal) return;
    document.addEventListener('keydown', (event) => {
        if (!modal.classList.contains('active')) return;
        if (event.key === 'ArrowLeft') prevAnalogicaSlideFullscreen();
        if (event.key === 'ArrowRight') nextAnalogicaSlideFullscreen();
        if (event.key === 'Escape') closeAnalogicaFullscreen();
    });
});
