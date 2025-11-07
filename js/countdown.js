// Cuenta atrás para el evento
// Configura la fecha del evento aquí (año, mes (0-11), día, hora, minutos)
const eventDate = new Date(2026, 8, 12, 12, 30, 0).getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    // Cálculos de tiempo
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Actualizar los elementos en el DOM
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;

    // Si la cuenta atrás ha terminado
    if (distance < 0) {
        clearInterval(countdownInterval);
        document.querySelector('.countdown-container').innerHTML = 
            '<div class="countdown-finished"><h2>¡El evento ha comenzado! 🎉</h2></div>';
    }
}

// Actualizar la cuenta atrás cada segundo
const countdownInterval = setInterval(updateCountdown, 1000);

// Ejecutar inmediatamente al cargar
updateCountdown();
