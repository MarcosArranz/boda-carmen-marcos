const fotografiaPhotosPerPage = 12;
let fotografiaCurrentSlide = 0;
let fotografiaCurrentPage = 0;

function getFotografiaSlides() {
    return Array.isArray(window.fotografiaSlides) ? window.fotografiaSlides : [];
}

function fotografiaPageStart(page) {
    return page * fotografiaPhotosPerPage;
}

function renderFotografiaPage() {
    const grid = document.getElementById('fotografiaGrid');
    const pageCounter = document.querySelector('.fotografia-page-counter');
    const fotografiaSlides = getFotografiaSlides();

    if (!grid) return;
    if (fotografiaSlides.length === 0) {
        grid.innerHTML = '';
        if (pageCounter) pageCounter.textContent = 'Página 0 de 0';
        return;
    }

    const totalPages = Math.ceil(fotografiaSlides.length / fotografiaPhotosPerPage);
    const firstPhoto = fotografiaPageStart(fotografiaCurrentPage);
    const pagePhotos = fotografiaSlides.slice(firstPhoto, firstPhoto + fotografiaPhotosPerPage);

    grid.innerHTML = pagePhotos.map((src, pageIndex) => {
        const photoIndex = firstPhoto + pageIndex;
        const selectedClass = photoIndex === fotografiaCurrentSlide ? ' selected' : '';
        return `<button class="fotomaton-thumbnail${selectedClass}" type="button" onclick="selectFotografiaPhoto(${photoIndex})" title="Seleccionar foto ${photoIndex + 1}">
            <img src="${MediaUtils.thumbUrl(src)}" alt="Foto de la fotógrafa ${photoIndex + 1}" loading="lazy" decoding="async" width="480" height="480" data-original="${src}">
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
        pageCounter.textContent = `Página ${fotografiaCurrentPage + 1} de ${totalPages}`;
    }

    const pageInput = document.getElementById('fotografiaPageInput');
    if (pageInput) {
        pageInput.max = String(totalPages);
        pageInput.value = String(fotografiaCurrentPage + 1);
    }

    warmFotografiaPage(fotografiaCurrentPage + 1);
    warmFotografiaPage(fotografiaCurrentPage - 1);
}

function warmFotografiaPage(page) {
    const fotografiaSlides = getFotografiaSlides();
    const totalPages = Math.ceil(fotografiaSlides.length / fotografiaPhotosPerPage);
    if (page < 0 || page >= totalPages) return;

    const firstPhoto = fotografiaPageStart(page);
    const urls = fotografiaSlides
        .slice(firstPhoto, firstPhoto + fotografiaPhotosPerPage)
        .map((src) => MediaUtils.thumbUrl(src));

    MediaUtils.warm(urls);
}

function selectFotografiaPhoto(index) {
    const fotografiaSlides = getFotografiaSlides();
    if (!fotografiaSlides.length) return;

    fotografiaCurrentSlide = index;
    document.querySelectorAll('#fotografiaGrid .fotomaton-thumbnail').forEach((thumbnail, pageIndex) => {
        const photoIndex = fotografiaPageStart(fotografiaCurrentPage) + pageIndex;
        thumbnail.classList.toggle('selected', photoIndex === index);
    });
    openFotografiaFullscreen();
}

function nextFotografiaPage() {
    const totalPages = Math.ceil(getFotografiaSlides().length / fotografiaPhotosPerPage);
    if (!totalPages) return;
    fotografiaCurrentPage = (fotografiaCurrentPage + 1) % totalPages;
    renderFotografiaPage();
}

function prevFotografiaPage() {
    const totalPages = Math.ceil(getFotografiaSlides().length / fotografiaPhotosPerPage);
    if (!totalPages) return;
    fotografiaCurrentPage = (fotografiaCurrentPage - 1 + totalPages) % totalPages;
    renderFotografiaPage();
}

function jumpToFotografiaPage(event) {
    if (event) event.preventDefault();

    const input = document.getElementById('fotografiaPageInput');
    const totalPages = Math.ceil(getFotografiaSlides().length / fotografiaPhotosPerPage);
    if (!input || !totalPages) return;

    const requested = Number.parseInt(input.value, 10);
    const page = Number.isFinite(requested)
        ? Math.min(Math.max(requested, 1), totalPages)
        : fotografiaCurrentPage + 1;

    fotografiaCurrentPage = page - 1;
    renderFotografiaPage();
}

function downloadFotografiaPhoto() {
    const fotografiaSlides = getFotografiaSlides();
    if (!fotografiaSlides.length) return;
    const imageUrl = fotografiaSlides[fotografiaCurrentSlide];
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = imageUrl.split('/').pop();
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}

function updateFotografiaFullscreen() {
    const fotografiaSlides = getFotografiaSlides();
    if (!fotografiaSlides.length) return;

    const image = document.getElementById('fotografiaFullscreenImage');
    const counter = document.querySelector('.fotografia-fullscreen-counter');
    if (!image) return;

    image.classList.add('is-loading');
    MediaUtils.loadInto(image, fotografiaSlides[fotografiaCurrentSlide], (el) => el.classList.remove('is-loading'));

    if (counter) {
        counter.textContent = `${fotografiaCurrentSlide + 1} / ${fotografiaSlides.length}`;
    }

    const total = fotografiaSlides.length;
    const urls = [1, -1].map((offset) =>
        MediaUtils.largeUrl(fotografiaSlides[(fotografiaCurrentSlide + offset + total) % total])
    );
    MediaUtils.warm(urls);
}

function openFotografiaFullscreen() {
    const fotografiaSlides = getFotografiaSlides();
    if (!fotografiaSlides.length) return;

    const modal = document.getElementById('fotografiaFullscreenModal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateFotografiaFullscreen();
}

function closeFotografiaFullscreen() {
    const modal = document.getElementById('fotografiaFullscreenModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function nextFotografiaSlideFullscreen() {
    const fotografiaSlides = getFotografiaSlides();
    if (!fotografiaSlides.length) return;
    fotografiaCurrentSlide = (fotografiaCurrentSlide + 1) % fotografiaSlides.length;
    updateFotografiaFullscreen();
}

function prevFotografiaSlideFullscreen() {
    const fotografiaSlides = getFotografiaSlides();
    if (!fotografiaSlides.length) return;
    fotografiaCurrentSlide = (fotografiaCurrentSlide - 1 + fotografiaSlides.length) % fotografiaSlides.length;
    updateFotografiaFullscreen();
}

document.addEventListener('DOMContentLoaded', () => {
    renderFotografiaPage();
    const modal = document.getElementById('fotografiaFullscreenModal');
    if (!modal) return;
    document.addEventListener('keydown', (event) => {
        if (!modal.classList.contains('active')) return;
        if (event.key === 'ArrowLeft') prevFotografiaSlideFullscreen();
        if (event.key === 'ArrowRight') nextFotografiaSlideFullscreen();
        if (event.key === 'Escape') closeFotografiaFullscreen();
    });
});
