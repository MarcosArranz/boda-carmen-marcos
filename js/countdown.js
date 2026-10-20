// Cuenta atrás para el evento.
// El temporizador solo corre cuando la sección está en pantalla (o la pestaña
// está visible), para no gastar batería mientras se miran las fotos.
(function () {
    'use strict';

    // Año, mes (0-11), día, hora y minutos del evento
    var EVENT_TIME = new Date(2026, 8, 12, 12, 30, 0).getTime();

    var section = document.getElementById('countdown');
    var container = section ? section.querySelector('.countdown-container') : null;
    if (!container) return;

    var fields = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };

    var timer = null;
    var visible = false;
    var finished = false;

    function setText(element, value) {
        if (element && element.textContent !== value) element.textContent = value;
    }

    function finish() {
        if (finished) return;
        finished = true;
        stop();
        container.innerHTML = '<div class="countdown-finished">Muchas gracias por todo :)</div>';
    }

    function render() {
        var distance = EVENT_TIME - Date.now();

        if (distance <= 0) {
            finish();
            return;
        }

        setText(fields.days, String(Math.floor(distance / 86400000)));
        setText(fields.hours, String(Math.floor((distance % 86400000) / 3600000)));
        setText(fields.minutes, String(Math.floor((distance % 3600000) / 60000)));
        setText(fields.seconds, String(Math.floor((distance % 60000) / 1000)));
    }

    function start() {
        if (timer || finished) return;
        render();
        timer = window.setInterval(render, 1000);
    }

    function stop() {
        if (!timer) return;
        window.clearInterval(timer);
        timer = null;
    }

    if (EVENT_TIME - Date.now() <= 0) {
        finish();
        return;
    }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (visible && !document.hidden) start();
            else stop();
        }, { threshold: 0 }).observe(container);
    } else {
        start();
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else if (visible) start();
    });
})();
