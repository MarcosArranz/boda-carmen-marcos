// Carrusel de fotos del evento
const slides = [
    'images/6.jpg',
    'images/8.jpeg',
    'images/11.jpeg',
    'images/5.jpg',
    'images/1.jpeg',
    'images/2.jpeg',
    'images/3.jpg',
    'images/10.jpeg',
    'images/7.jpeg',
    'images/9.jpeg',
    'images/12.jpeg',
    'images/13.jpeg',
    'images/14.jpg',
    'images/15.jpg',
    'images/16.jpg',
    'images/17.jpg',
    'images/18.jpg',
    'images/19.jpg',
    'images/20.jpg',
    'images/21.jpg',
    'images/22.JPG',
    'images/23.jpg',
    'images/24.JPG',
    'images/25.jpg',
    'images/26.jpg',
    'images/27.JPG',
    'images/28.jpg',
    'images/29.jpg',
    'images/30.jpg',
    'images/31.jpg',
    // Si quieres usar tu video pon aquí el fichero. Coloca el archivo en `videos/1.mov` o cambia la ruta.
    'images/1.mp4'
];

const VIDEO_PATTERN = /\.(mp4|webm|mov)$/i;
const TRANSITION_MS = 380;

let currentSlide = 0;
let renderedSlide = 0;
let currentMediaEl = null;
let standbyImage = null;
let layerA = null;
let layerB = null;
let counterEl = null;
let slideQueue = Promise.resolve();

function isVideoSource(src) {
    return VIDEO_PATTERN.test(src);
}

function normalizeSlide(n) {
    const total = slides.length;
    return ((n % total) + total) % total;
}

function updateSlideCounter() {
    if (counterEl) counterEl.textContent = `${currentSlide + 1} / ${slides.length}`;
}

function fadeTo(el) {
    if (!el) return;
    if (currentMediaEl && currentMediaEl !== el) {
        currentMediaEl.classList.remove('is-active');
        if (currentMediaEl.tagName === 'IMG') currentMediaEl.setAttribute('aria-hidden', 'true');
    }
    el.classList.add('is-active');
    currentMediaEl = el;
}

function removeCarouselVideo() {
    const video = document.querySelector('.carousel-stage video');
    if (!video) return;
    try {
        video.pause();
        video.removeAttribute('src');
        video.load();
    } catch (e) { /* ignorar */ }
    video.remove();
}

function showVideoSlide(src) {
    return new Promise((resolve) => {
        removeCarouselVideo();

        const video = document.createElement('video');
        video.className = 'carousel-image carousel-video';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('loop', '');
        video.setAttribute('aria-label', 'Video del evento');
        video.src = src;

        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            fadeTo(video);
            resolve(video);
        };

        video.addEventListener('loadeddata', finish, { once: true });
        video.addEventListener('error', () => {
            video.remove();
            if (!done) { done = true; resolve(null); }
        }, { once: true });
        setTimeout(finish, 2500);

        document.querySelector('.carousel-stage').appendChild(video);
        try { video.load(); } catch (e) { /* ignorar */ }
        const playPromise = video.play();
        if (playPromise && playPromise.catch) playPromise.catch(() => { /* autoplay bloqueado */ });
    });
}

async function renderSlide(target) {
    // Si el usuario ha pulsado varias veces, saltamos los pasos intermedios.
    if (target !== currentSlide || target === renderedSlide) return;

    const src = slides[target];

    if (isVideoSource(src)) {
        await showVideoSlide(src);
    } else {
        removeCarouselVideo();
        const layer = standbyImage;
        if (!layer) return;

        await MediaUtils.loadInto(layer, src);
        if (target !== currentSlide) return; // se pidió otra foto mientras cargaba

        layer.alt = 'Foto del evento';
        layer.removeAttribute('aria-hidden');
        fadeTo(layer);
        standbyImage = layer === layerA ? layerB : layerA;
    }

    renderedSlide = target;
    updateSlideCounter();
    warmNeighbourSlides();
}

function requestSlide(target) {
    const nextSlideIndex = normalizeSlide(target);
    currentSlide = nextSlideIndex;
    updateSlideCounter();
    slideQueue = slideQueue.then(() => renderSlide(nextSlideIndex)).catch(() => {});
}

function stepSlide(delta) {
    requestSlide(currentSlide + delta);
}

function nextSlide() {
    stepSlide(1);
}

function prevSlide() {
    stepSlide(-1);
}

function warmNeighbourSlides() {
    const total = slides.length;
    const urls = [];
    [1, -1, 2].forEach((offset) => {
        const src = slides[(currentSlide + offset + total) % total];
        if (src && !isVideoSource(src)) urls.push(MediaUtils.largeUrl(src));
    });
    MediaUtils.warm(urls);
}

// ------- Pantalla completa -------

function getFullscreenImage() {
    return document.getElementById('fullscreenImage');
}

function updateFullscreenImage() {
    const modal = document.getElementById('fullscreenModal');
    const img = getFullscreenImage();
    const counter = document.getElementById('fullscreenCounter');
    if (!modal || !img) return;

    const src = slides[currentSlide];
    if (counter) counter.textContent = `${currentSlide + 1} / ${slides.length}`;

    const oldVideo = modal.querySelector('video.fullscreen-media');
    if (oldVideo) {
        try {
            oldVideo.pause();
            oldVideo.removeAttribute('src');
            oldVideo.load();
        } catch (e) { /* ignorar */ }
        oldVideo.remove();
    }

    if (isVideoSource(src)) {
        img.classList.add('is-hidden');

        const video = document.createElement('video');
        video.className = 'fullscreen-media';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('loop', '');
        video.setAttribute('aria-label', 'Video a pantalla completa');
        video.src = src;
        modal.insertBefore(video, modal.querySelector('.fullscreen-controls'));

        try { video.load(); } catch (e) { /* ignorar */ }
        setTimeout(() => {
            const p = video.play();
            if (p && p.catch) p.catch(() => { /* autoplay bloqueado */ });
        }, 50);
    } else {
        img.classList.remove('is-hidden');
        img.classList.add('is-loading');
        MediaUtils.loadInto(img, src, (el) => el.classList.remove('is-loading'));
    }

    warmFullscreenNeighbours();
}

function warmFullscreenNeighbours() {
    const total = slides.length;
    const urls = [];
    [1, -1].forEach((offset) => {
        const src = slides[(currentSlide + offset + total) % total];
        if (src && !isVideoSource(src)) urls.push(MediaUtils.largeUrl(src));
    });
    MediaUtils.warm(urls);
}

function openFullscreen() {
    const modal = document.getElementById('fullscreenModal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateFullscreenImage();
}

function closeFullscreen() {
    const modal = document.getElementById('fullscreenModal');
    if (!modal) return;

    const video = modal.querySelector('video.fullscreen-media');
    if (video) {
        try {
            video.pause();
            video.removeAttribute('src');
            video.load();
        } catch (e) { /* ignorar */ }
        video.remove();
    }

    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function nextSlideFullscreen() {
    stepSlide(1);
    updateFullscreenImage();
}

function prevSlideFullscreen() {
    stepSlide(-1);
    updateFullscreenImage();
}

function handleFullscreenKeydown(e) {
    const modal = document.getElementById('fullscreenModal');
    if (!modal || !modal.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') prevSlideFullscreen();
    if (e.key === 'ArrowRight') nextSlideFullscreen();
    if (e.key === 'Escape') closeFullscreen();
}

// ------- Utilidades de la página -------

// Función para volver al principio de la página
function scrollToTop(e) {
    if (e) e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Función para copiar el IBAN al portapapeles
function copyIBAN() {
    const iban = 'ES61 0128 6001 7801 0019 5314';
    const ibanWithoutSpaces = iban.replace(/\s/g, '');
    const btn = document.querySelector('.copy-btn');

    const markCopied = () => {
        if (!btn) return;
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ibanWithoutSpaces).then(markCopied).catch(() => {
            alert('Número de cuenta: ' + iban);
        });
    } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = ibanWithoutSpaces;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            markCopied();
        } catch (err) {
            alert('Número de cuenta: ' + iban);
        }
        document.body.removeChild(textArea);
    }
}

// ------- Inicialización -------

document.addEventListener('DOMContentLoaded', () => {
    layerA = document.getElementById('carouselLayerA');
    layerB = document.getElementById('carouselLayerB');
    counterEl = document.querySelector('#gallery .slide-counter');

    if (layerA) {
        layerA.classList.add('is-active');
        currentMediaEl = layerA;
        standbyImage = layerB;
        // La primera foto ya viene en el HTML: solo hace falta refrescar el contador.
        updateSlideCounter();
        warmNeighbourSlides();
    }

    document.addEventListener('keydown', handleFullscreenKeydown);
});
