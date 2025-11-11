// Script para animar elementos cuando aparecen en viewport
document.addEventListener('DOMContentLoaded', () => {
    // Detectar si es dispositivo móvil
    const isMobile = window.innerWidth <= 768;

    // Crear observer para detectar cuando los elementos entran en viewport
    const observerOptions = {
        threshold: isMobile ? 0.2 : 0.1,
        rootMargin: isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px'
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

    // En móvil, mostrar secciones más rápido
    if (isMobile) {
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            el.style.animationDuration = '0.6s';
        });
    }
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

// Mejorar rendimiento en móvil deshabilitando algunas animaciones
if (window.innerWidth <= 480) {
    // Reducir animaciones en teléfonos pequeños
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 480px) {
            .info-card, .hotel-card, .countdown-item, .timeline-item {
                animation-duration: 0.5s !important;
            }
            
            .hero-title {
                animation-duration: 0.8s !important;
            }
            
            /* Deshabilitar algunas animaciones hover en móvil */
            @media (hover: none) {
                .nav-menu a:hover::after {
                    width: 0;
                }
                
                .info-icon {
                    transition: none;
                }
                
                .info-card:hover {
                    transform: none;
                }
            }
        }
    `;
    document.head.appendChild(style);
}
