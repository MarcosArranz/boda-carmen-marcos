// Animaciones de aparición al hacer scroll.
// Se usa IntersectionObserver (sin listeners de scroll) y se deja de observar
// cada elemento en cuanto aparece, para no consumir recursos de más.
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealElements = document.querySelectorAll(
        '.scroll-reveal, .info-grid, .timeline, .hotels-grid'
    );

    const revealAll = () => revealElements.forEach((el) => el.classList.add('visible'));

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
        revealAll();
        return;
    }

    const isMobile = window.innerWidth <= 768;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: isMobile ? 0.2 : 0.1,
        rootMargin: isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px'
    });

    revealElements.forEach((el) => {
        if (!el.classList.contains('scroll-reveal')) el.classList.add('scroll-reveal');
        observer.observe(el);
    });

    // En móvil las animaciones son algo más cortas para que la página se sienta ágil.
    if (isMobile) {
        revealElements.forEach((el) => {
            el.style.animationDuration = '0.6s';
        });
    }

    // Red de seguridad: si al cabo de un momento hay contenido ya visible en
    // pantalla que el observer no ha revelado, lo mostramos igualmente.
    setTimeout(() => {
        revealElements.forEach((el) => {
            if (el.classList.contains('visible')) return;
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > -200) {
                el.classList.add('visible');
            }
        });
    }, 2500);
});
