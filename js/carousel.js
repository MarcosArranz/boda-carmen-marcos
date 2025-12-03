// Carrusel de fotos
let currentSlide = 0;
let isAnimating = false;
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
    'images/22.jpg',
    'images/23.jpg',
    'images/24.jpg',
    'images/25.jpg',
    'images/26.jpg',
    'images/27.jpg',
    'images/28.jpg',
    'images/29.jpg',
    'images/30.jpg',
    'images/31.jpg',
        // Si quieres usar tu video pon aquí el fichero. Coloca el archivo en `videos/1.mov` o cambia la ruta.
    'images/1.mp4'
];

// Precargar todas las imágenes
function preloadImages() {
    slides.forEach((src) => {
        // Solo precargar metadata de vídeo y las imágenes reales
        if (/\.(mp4|webm|mov)$/i.test(src)) {
            try {
                const v = document.createElement('video');
                v.preload = 'metadata';
                v.src = src;
            } catch (e) {
                // ignore
            }
        } else {
            const img = new Image();
            img.src = src;
        }
    });
}

// Precargar solo las primeras imágenes de forma inmediata
function preloadInitialImages() {
    // Precargar las primeras 5 medias (imágenes o metadata de vídeo)
    slides.slice(0, 5).forEach((src) => {
        if (/\.(mp4|webm|mov)$/i.test(src)) {
            try {
                const v = document.createElement('video');
                v.preload = 'metadata';
                v.src = src;
            } catch (e) {}
        } else {
            const img = new Image();
            img.src = src;
        }
    });
}

// Precargar el resto de imágenes de forma diferida
function preloadRemainingImages() {
    // Precargar las medias restantes después de 2 segundos
    setTimeout(() => {
        slides.slice(5).forEach((src, index) => {
            // Espaciar la carga de cada media 500ms
            setTimeout(() => {
                if (/\.(mp4|webm|mov)$/i.test(src)) {
                    try {
                        const v = document.createElement('video');
                        v.preload = 'metadata';
                        v.src = src;
                    } catch (e) {}
                } else {
                    const img = new Image();
                    img.src = src;
                }
            }, index * 500);
        });
    }, 2000);
}

function showSlide(n) {
    // Evitar múltiples animaciones al mismo tiempo
    if (isAnimating) return;
    isAnimating = true;
    
    const carousel = document.querySelector('.carousel-image');
    const slideCounter = document.querySelector('.slide-counter');
    
    if (n >= slides.length) {
        currentSlide = 0;
    } else if (n < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = n;
    }
    
    if (carousel) {
        // Aplicar clase de salida al elemento actual
        carousel.classList.remove('fade-in');
        carousel.classList.add('fade-out');

        // Cambiar media casi al inicio del blur (cuando está muy desenfocada)
        setTimeout(() => {
            const src = slides[currentSlide];
            const isVideo = /\.(mp4|webm|mov)$/i.test(src);

            // Crear nuevo elemento de media
            let newMedia;
            if (isVideo) {
                newMedia = document.createElement('video');
                newMedia.className = 'carousel-image';
                // atributos antes de asignar src
                newMedia.setAttribute('muted', '');
                newMedia.muted = true;
                newMedia.setAttribute('playsinline', '');
                newMedia.setAttribute('webkit-playsinline', '');
                newMedia.setAttribute('loop', '');
                newMedia.setAttribute('aria-label', 'Video del evento');
                newMedia.autoplay = true;
                newMedia.playsInline = true;
                newMedia.loop = true;
                newMedia.src = src;
                // forzar carga y luego reproducir
                try { newMedia.load(); } catch (e) {}
            } else {
                newMedia = document.createElement('img');
                newMedia.src = src;
                newMedia.className = 'carousel-image';
                newMedia.alt = 'Foto del evento';
            }

            // Añadir transición de entrada
            newMedia.classList.add('fade-in');

            // Reemplazar el elemento antiguo por el nuevo
            const parent = carousel.parentNode;
            // eliminar botón play previo si existiera
            const prevBtn = parent.querySelector('.media-play-btn');
            if (prevBtn) prevBtn.parentNode.removeChild(prevBtn);

            parent.replaceChild(newMedia, carousel);

            // Si es vídeo, intentar reproducir automáticamente y en bucle (sin botón)
            if (isVideo) {
                try {
                    // Asegurar propiedades (ya configuradas antes) y forzar play
                    newMedia.muted = true; // necesario en muchos navegadores para autoplay
                    newMedia.loop = true;
                    const playPromise = newMedia.play();
                    if (playPromise !== undefined) {
                        playPromise.catch((err) => {
                            console.warn('Autoplay bloqueado o error en play():', err);
                            // Si falla, el vídeo permanecerá pausado; usuario puede abrir fullscreen para controls
                        });
                    }
                } catch (e) {
                    console.warn('Reproducción de vídeo fallida', e);
                }
            }

            // Permitir siguiente animación después de que termine
            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }, 50);
    }
    
    if (slideCounter) {
        slideCounter.textContent = `${currentSlide + 1} / ${slides.length}`;
    }
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

// Funciones para pantalla completa
function openFullscreen() {
    const modal = document.getElementById('fullscreenModal');
    modal.classList.add('active');
    updateFullscreenImage();
    document.body.style.overflow = 'hidden';
    
    // Soporte para teclas de flecha en fullscreen
    document.addEventListener('keydown', handleFullscreenKeydown);
}

function closeFullscreen() {
    const modal = document.getElementById('fullscreenModal');
    // Pausar y eliminar cualquier vídeo que pudiera estar reproduciéndose
    const media = document.getElementById('fullscreenImage');
    if (media) {
        try {
            if (media.tagName && media.tagName.toLowerCase() === 'video') {
                media.pause();
                media.removeAttribute('src');
            }
            // eliminar elemento del DOM
            media.parentNode.removeChild(media);
        } catch (e) {
            console.warn('No se pudo limpiar el media fullscreen', e);
        }
    }
    // eliminar botón play si existe
    try {
        const modal = document.getElementById('fullscreenModal');
        const prevBtn = modal.querySelector('.media-play-btn');
        if (prevBtn) prevBtn.parentNode.removeChild(prevBtn);
    } catch (e) {}
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.removeEventListener('keydown', handleFullscreenKeydown);
}

function updateFullscreenImage() {
    const fullscreenCounter = document.getElementById('fullscreenCounter');
    const existing = document.getElementById('fullscreenImage');
    const src = slides[currentSlide];
    const isVideo = /\.(mp4|webm|mov)$/i.test(src);

    // Si existe un elemento previo, lo eliminamos antes de crear el nuevo
    if (existing) existing.parentNode.removeChild(existing);

    if (isVideo) {
        const video = document.createElement('video');
        video.id = 'fullscreenImage';
        video.className = 'fullscreen-media';
        // atributos útiles para autoplay y iOS
        video.setAttribute('muted', '');
        video.muted = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('loop', '');
        video.autoplay = true;
        video.playsInline = true;
        video.loop = true;
        video.setAttribute('aria-label', 'Video a pantalla completa');
        video.src = src;
        try { video.load(); } catch (e) {}
        // Intentar reproducir y manejar la promesa
        setTimeout(() => {
            const p = video.play();
            if (p && p.catch) p.catch(() => { /* autoplay bloqueado */ });
        }, 50);
        // Insertar antes del contenedor de controles (si existe)
        const modal = document.getElementById('fullscreenModal');
        modal.insertBefore(video, modal.querySelector('.fullscreen-controls'));

        // No crear botón de play en fullscreen — el vídeo se reproduce automáticamente o el usuario usa controles del navegador
    } else {
        const img = document.createElement('img');
        img.id = 'fullscreenImage';
        img.src = src;
        img.alt = 'Foto a pantalla completa';
        img.className = 'fullscreen-media';
        const modal = document.getElementById('fullscreenModal');
        modal.insertBefore(img, modal.querySelector('.fullscreen-controls'));
    }

    if (fullscreenCounter) fullscreenCounter.textContent = `${currentSlide + 1} / ${slides.length}`;
}

function nextSlideFullscreen() {
    showSlide(currentSlide + 1);
    updateFullscreenImage();
}

function prevSlideFullscreen() {
    showSlide(currentSlide - 1);
    updateFullscreenImage();
}

function handleFullscreenKeydown(e) {
    if (e.key === 'ArrowLeft') prevSlideFullscreen();
    if (e.key === 'ArrowRight') nextSlideFullscreen();
    if (e.key === 'Escape') closeFullscreen();
}

// Función para volver al principio de la página
function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Inicializar carrusel cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Precargar solo las primeras 5 imágenes de inmediato
    preloadInitialImages();
    
    // Esperar un poco para asegurar que la primera imagen se cargue
    setTimeout(() => {
        showSlide(0);
    }, 100);
    
    // Precargar el resto de imágenes de forma diferida
    preloadRemainingImages();
    
    // Soporte para teclas de flecha
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
});

// También precargar cuando la ventana carga completamente
window.addEventListener('load', () => {
    // En caso de que no se haya precargado todo, hacerlo ahora
    preloadImages();
});

// Función para copiar el IBAN al portapapeles
function copyIBAN() {
    const iban = 'ES61 0128 6001 7801 0019 5314';
    const ibanWithoutSpaces = iban.replace(/\s/g, '');
    
    // Intentar copiar al portapapeles
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ibanWithoutSpaces).then(() => {
            // Cambiar el ícono temporalmente para mostrar éxito
            const btn = document.querySelector('.copy-btn');
            const icon = btn.querySelector('i');
            icon.className = 'fas fa-check';
            btn.style.background = '#4caf50';
            
            setTimeout(() => {
                icon.className = 'fas fa-copy';
                btn.style.background = '';
            }, 2000);
        }).catch(err => {
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
            const btn = document.querySelector('.copy-btn');
            const icon = btn.querySelector('i');
            icon.className = 'fas fa-check';
            btn.style.background = '#4caf50';
            
            setTimeout(() => {
                icon.className = 'fas fa-copy';
                btn.style.background = '';
            }, 2000);
        } catch (err) {
            alert('Número de cuenta: ' + iban);
        }
        document.body.removeChild(textArea);
    }
}
