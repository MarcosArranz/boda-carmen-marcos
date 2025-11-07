// Carrusel de fotos
let currentSlide = 0;
const slides = [
    'images/1.jpeg',
    'images/2.jpeg',
    'images/3.jpg',
    'images/5.jpg',
    'images/6.jpg',
    'images/7.jpeg',
    'images/8.jpeg',
    'images/9.jpeg',
    'images/10.jpeg',
    'images/11.jpeg',
    'images/12.jpeg',
    'images/13.jpeg'
];

function showSlide(n) {
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
        carousel.src = slides[currentSlide];
        carousel.style.opacity = '0';
        setTimeout(() => {
            carousel.style.opacity = '1';
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

// Inicializar carrusel cuando cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    showSlide(0);
    
    // Soporte para teclas de flecha
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
});
