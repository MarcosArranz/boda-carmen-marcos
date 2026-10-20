// Aparición suave de los bloques al hacer scroll.
// Usa IntersectionObserver (sin listeners de scroll) y deja de observar cada
// bloque en cuanto aparece, para no consumir recursos de más.
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealElements = Array.from(document.querySelectorAll(
        '.info-grid, .timeline, .hotels-grid, .info-details, .map-container, .countdown-container, .account-content'
    ));

    if (!revealElements.length) return;

    const revealAll = () => revealElements.forEach((el) => el.classList.add('visible'));

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
        revealAll();
        return;
    }

    revealElements.forEach((el) => el.classList.add('scroll-reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0,
        rootMargin: '0px 0px -8% 0px'
    });

    revealElements.forEach((el) => observer.observe(el));

    // Red de seguridad: si algo falla, lo que ya está en pantalla se muestra igual.
    window.setTimeout(() => {
        revealElements.forEach((el) => {
            if (el.classList.contains('visible')) return;
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }, 2500);
});
