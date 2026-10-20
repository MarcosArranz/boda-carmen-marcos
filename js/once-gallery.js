const oncePhotosPerPage = 12;
let onceCurrentSlide = 0;
let onceCurrentPage = 0;

function getOnceSlides() {
    return Array.isArray(window.onceSlides) ? window.onceSlides : [];
}

function oncePageStart(page) {
    return page * oncePhotosPerPage;
}

function renderOncePage() {
    const grid = document.getElementById('onceGrid');
    const pageCounter = document.querySelector('.once-page-counter');
    const onceSlides = getOnceSlides();

    if (!grid) return;
    if (onceSlides.length === 0) {
        grid.innerHTML = '';
        if (pageCounter) pageCounter.textContent = 'Página 0 de 0';
        return;
    }

    const totalPages = Math.ceil(onceSlides.length / oncePhotosPerPage);
    const firstPhoto = oncePageStart(onceCurrentPage);
    const pagePhotos = onceSlides.slice(firstPhoto, firstPhoto + oncePhotosPerPage);

    grid.innerHTML = pagePhotos.map((src, pageIndex) => {
        const photoIndex = firstPhoto + pageIndex;
        const selectedClass = photoIndex === onceCurrentSlide ? ' selected' : '';
        return `<button class="fotomaton-thumbnail${selectedClass}" type="button" onclick="selectOncePhoto(${photoIndex})" title="Seleccionar foto ${photoIndex + 1}">
            <img src="${MediaUtils.thumbUrl(src)}" alt="Foto de ONCE ${photoIndex + 1}" loading="lazy" decoding="async" width="480" height="480" data-original="${src}">
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
        pageCounter.textContent = `Página ${onceCurrentPage + 1} de ${totalPages}`;
    }

    warmOncePage(onceCurrentPage + 1);
    warmOncePage(onceCurrentPage - 1);
}

function warmOncePage(page) {
    const onceSlides = getOnceSlides();
    const totalPages = Math.ceil(onceSlides.length / oncePhotosPerPage);
    if (page < 0 || page >= totalPages) return;

    const firstPhoto = oncePageStart(page);
    const urls = onceSlides
        .slice(firstPhoto, firstPhoto + oncePhotosPerPage)
        .map((src) => MediaUtils.thumbUrl(src));

    MediaUtils.warm(urls);
}

function selectOncePhoto(index) {
    const onceSlides = getOnceSlides();
    if (!onceSlides.length) return;

    onceCurrentSlide = index;
    document.querySelectorAll('#onceGrid .fotomaton-thumbnail').forEach((thumbnail, pageIndex) => {
        const photoIndex = oncePageStart(onceCurrentPage) + pageIndex;
        thumbnail.classList.toggle('selected', photoIndex === index);
    });
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

function updateOnceFullscreen() {
    const onceSlides = getOnceSlides();
    if (!onceSlides.length) return;

    const image = document.getElementById('onceFullscreenImage');
    const counter = document.querySelector('.once-fullscreen-counter');
    if (!image) return;

    image.classList.add('is-loading');
    MediaUtils.loadInto(image, onceSlides[onceCurrentSlide], (el) => el.classList.remove('is-loading'));

    if (counter) {
        counter.textContent = `${onceCurrentSlide + 1} / ${onceSlides.length}`;
    }

    const total = onceSlides.length;
    const urls = [1, -1].map((offset) =>
        MediaUtils.largeUrl(onceSlides[(onceCurrentSlide + offset + total) % total])
    );
    MediaUtils.warm(urls);
}

function openOnceFullscreen() {
    const onceSlides = getOnceSlides();
    if (!onceSlides.length) return;

    const modal = document.getElementById('onceFullscreenModal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateOnceFullscreen();
}

function closeOnceFullscreen() {
    const modal = document.getElementById('onceFullscreenModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
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
