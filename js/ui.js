/**
 * Pequeñas mejoras de interfaz, sin dependencias:
 *  - sombra del navbar y enlace activo
 *  - mapa bajo demanda (Google Maps solo se carga si se pulsa)
 *  - gestos de deslizar en el carrusel y en las fotos a pantalla completa
 *  - cerrar las fotos tocando el fondo
 */
(function () {
    'use strict';

    /* ---------- Navbar ---------- */
    var navbar = document.getElementById('navbar');
    var scrollTick = false;

    function updateNavbar() {
        if (!navbar) return;
        navbar.classList.toggle('is-scrolled', window.scrollY > 12);
        scrollTick = false;
    }

    if (navbar) {
        window.addEventListener('scroll', function () {
            if (scrollTick) return;
            scrollTick = true;
            window.requestAnimationFrame(updateNavbar);
        }, { passive: true });
        updateNavbar();
    }

    /* ---------- Enlace activo del menú ---------- */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-menu a'));
    var linkBySection = new Map();

    navLinks.forEach(function (link) {
        var id = link.getAttribute('href');
        if (!id || id.charAt(0) !== '#') return;
        var section = document.querySelector(id);
        if (section) linkBySection.set(section, link);
    });

    if (linkBySection.size && 'IntersectionObserver' in window) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var active = linkBySection.get(entry.target);
                if (!active) return;
                navLinks.forEach(function (link) { link.classList.remove('is-active'); });
                active.classList.add('is-active');
            });
        }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });

        linkBySection.forEach(function (_link, section) {
            navObserver.observe(section);
        });
    }

    /* ---------- Mapa bajo demanda ---------- */
    var mapFacade = document.getElementById('mapFacade');

    if (mapFacade) {
        mapFacade.addEventListener('click', function () {
            var wrapper = document.getElementById('mapWrapper');
            if (!wrapper) return;

            var iframe = document.createElement('iframe');
            iframe.src = 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2133.639690091227!2d-3.1864367751238856!3d40.86260821435548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDDCsDUxJzQzLjEiTiAzwrAxMScxMy4yIlc!5e0!3m2!1ses!2ses!4v1762513113158!5m2!1ses!2ses';
            iframe.title = 'Mapa de la ubicación del evento';
            iframe.loading = 'lazy';
            iframe.referrerPolicy = 'no-referrer-when-downgrade';
            iframe.allowFullscreen = true;

            wrapper.innerHTML = '';
            wrapper.appendChild(iframe);
        }, { once: true });
    }

    /* ---------- Gestos ---------- */
    function isSwipe(dx, dy, elapsed) {
        return elapsed < 900 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3;
    }

    function enableSwipe(element, onNext, onPrev) {
        if (!element) return;

        var startX = 0;
        var startY = 0;
        var startTime = 0;

        element.addEventListener('touchstart', function (event) {
            if (event.touches.length !== 1) return;
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });

        element.addEventListener('touchend', function (event) {
            if (!startTime) return;
            var dx = event.changedTouches[0].clientX - startX;
            var dy = event.changedTouches[0].clientY - startY;
            var elapsed = Date.now() - startTime;
            startTime = 0;

            if (!isSwipe(dx, dy, elapsed)) return;
            if (dx < 0) onNext();
            else onPrev();
        }, { passive: true });
    }

    function setupModal(modal, onClose, onNext, onPrev) {
        if (!modal) return;

        var startX = 0;
        var startY = 0;
        var startTime = 0;
        var moved = false;

        modal.addEventListener('touchstart', function (event) {
            if (event.touches.length !== 1) return;
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            startTime = Date.now();
            moved = false;
        }, { passive: true });

        modal.addEventListener('touchmove', function (event) {
            if (!startTime) return;
            var dx = Math.abs(event.touches[0].clientX - startX);
            var dy = Math.abs(event.touches[0].clientY - startY);
            if (dx > 10 || dy > 10) moved = true;
        }, { passive: true });

        modal.addEventListener('touchend', function (event) {
            if (!startTime) return;
            var dx = event.changedTouches[0].clientX - startX;
            var dy = event.changedTouches[0].clientY - startY;
            var elapsed = Date.now() - startTime;
            startTime = 0;

            if (!isSwipe(dx, dy, elapsed)) return;
            moved = true;
            if (dx < 0) onNext();
            else onPrev();
        }, { passive: true });

        modal.addEventListener('click', function (event) {
            if (event.target !== modal) return;
            if (moved) {
                moved = false;
                return;
            }
            onClose();
        });
    }

    var swipeNext = window.nextSlide || function () {};
    var swipePrev = window.prevSlide || function () {};

    enableSwipe(document.querySelector('.carousel-stage'), swipeNext, swipePrev);

    setupModal(
        document.getElementById('fullscreenModal'),
        window.closeFullscreen || function () {},
        window.nextSlideFullscreen || function () {},
        window.prevSlideFullscreen || function () {}
    );

    setupModal(
        document.getElementById('fotomatonFullscreenModal'),
        window.closeFotomatonFullscreen || function () {},
        window.nextFotomatonSlideFullscreen || function () {},
        window.prevFotomatonSlideFullscreen || function () {}
    );

    setupModal(
        document.getElementById('onceFullscreenModal'),
        window.closeOnceFullscreen || function () {},
        window.nextOnceSlideFullscreen || function () {},
        window.prevOnceSlideFullscreen || function () {}
    );

    setupModal(
        document.getElementById('fotografiaFullscreenModal'),
        window.closeFotografiaFullscreen || function () {},
        window.nextFotografiaSlideFullscreen || function () {},
        window.prevFotografiaSlideFullscreen || function () {}
    );

    /* ---------- Flechas del teclado en el carrusel ---------- */
    var gallery = document.getElementById('gallery');
    var galleryVisible = false;

    if (gallery && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            galleryVisible = entries[0].isIntersecting;
        }, { threshold: 0.25 }).observe(gallery);
    }

    document.addEventListener('keydown', function (event) {
        if (!galleryVisible) return;
        if (document.querySelector('.fullscreen-modal.active')) return;

        var target = event.target;
        if (target && target.closest && target.closest('input, textarea, select, [contenteditable]')) return;

        if (event.key === 'ArrowRight' && typeof window.nextSlide === 'function') {
            event.preventDefault();
            window.nextSlide();
        } else if (event.key === 'ArrowLeft' && typeof window.prevSlide === 'function') {
            event.preventDefault();
            window.prevSlide();
        }
    });
})();
