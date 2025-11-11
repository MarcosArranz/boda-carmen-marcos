// Script para animar elementos cuando aparecen en viewport
document.addEventListener('DOMContentLoaded', () => {
    // Crear observer para detectar cuando los elementos entran en viewport
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Opcional: dejar de observar después de animar
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar todos los elementos con clase scroll-reveal
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    // Animar secciones específicas
    const sections = document.querySelectorAll('.info-grid, .timeline, .hotels-grid');
    sections.forEach(section => {
        observer.observe(section);
        section.classList.add('scroll-reveal');
    });
});

// Animar carrusel cuando cambia de foto
function animateCarouselChange() {
    const carouselImage = document.querySelector('.carousel-image');
    if (carouselImage) {
        carouselImage.classList.remove('fade-in');
        // Trigger reflow para reiniciar la animación
        void carouselImage.offsetWidth;
        carouselImage.classList.add('fade-in');
    }
}

// Interceptar las funciones de cambio de slide
const originalNextSlide = window.nextSlide;
const originalPrevSlide = window.prevSlide;

window.nextSlide = function() {
    originalNextSlide();
    animateCarouselChange();
};

window.prevSlide = function() {
    originalPrevSlide();
    animateCarouselChange();
};
