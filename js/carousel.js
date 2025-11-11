// Carrusel de fotos
let currentSlide = 0;
let isAnimating = false;
const slides = [
    'images/6.jpg',
    'images/5.jpg',
    'images/1.jpeg',
    'images/2.jpeg',
    'images/3.jpg',
    'images/10.jpeg',
    'images/7.jpeg',
    'images/8.jpeg',
    'images/9.jpeg',
    'images/11.jpeg',
    'images/12.jpeg',
    'images/13.jpeg'
];

// Precargar todas las imágenes
function preloadImages() {
    slides.forEach((imageSrc) => {
        const img = new Image();
        img.src = imageSrc;
    });
}

// Precargar solo las primeras imágenes de forma inmediata
function preloadInitialImages() {
    // Precargar las primeras 5 imágenes
    slides.slice(0, 5).forEach((imageSrc) => {
        const img = new Image();
        img.src = imageSrc;
    });
}

// Precargar el resto de imágenes de forma diferida
function preloadRemainingImages() {
    // Precargar las imágenes restantes después de 2 segundos
    setTimeout(() => {
        slides.slice(5).forEach((imageSrc, index) => {
            // Espaciar la carga de cada imagen 500ms
            setTimeout(() => {
                const img = new Image();
                img.src = imageSrc;
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
        // Aplicar clase de salida
        carousel.classList.remove('fade-in');
        carousel.classList.add('fade-out');
        
        // Cambiar imagen casi al inicio del blur (cuando está muy desenfocada)
        // Esto hace que el cambio sea imperceptible
        setTimeout(() => {
            carousel.src = slides[currentSlide];
            carousel.classList.remove('fade-out');
            carousel.classList.add('fade-in');
        }, 50);
        
        // Permitir siguiente animación después de que termine
        setTimeout(() => {
            isAnimating = false;
        }, 500);
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
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.removeEventListener('keydown', handleFullscreenKeydown);
}

function updateFullscreenImage() {
    const fullscreenImg = document.getElementById('fullscreenImage');
    const fullscreenCounter = document.getElementById('fullscreenCounter');
    
    fullscreenImg.src = slides[currentSlide];
    fullscreenCounter.textContent = `${currentSlide + 1} / ${slides.length}`;
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
