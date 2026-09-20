const fotomatonSlides = [
    'FOTOMATON/22961-GaleriaCliente834135.jpg',
    ...Array.from({ length: 410 }, (_, index) =>
        `FOTOMATON/22961-GaleriaCliente${834251 + index}.jpg`
    )
];

let fotomatonCurrentSlide = 0;
let fotomatonIsAnimating = false;

function showFotomatonSlide(index) {
    if (fotomatonIsAnimating) return;

    const carousel = document.querySelector('.fotomaton-carousel-image');
    const counter = document.querySelector('.fotomaton-slide-counter');
    if (!carousel) return;

    fotomatonIsAnimating = true;
    fotomatonCurrentSlide = (index + fotomatonSlides.length) % fotomatonSlides.length;
    carousel.classList.remove('fade-in');
    carousel.classList.add('fade-out');

    setTimeout(() => {
        carousel.src = fotomatonSlides[fotomatonCurrentSlide];
        carousel.classList.remove('fade-out');
        carousel.classList.add('fade-in');
        counter.textContent = `${fotomatonCurrentSlide + 1} / ${fotomatonSlides.length}`;
        fotomatonIsAnimating = false;
    }, 250);
}

function nextFotomatonSlide() {
    showFotomatonSlide(fotomatonCurrentSlide + 1);
}

function prevFotomatonSlide() {
    showFotomatonSlide(fotomatonCurrentSlide - 1);
}

function downloadFotomatonPhoto() {
    const imageUrl = fotomatonSlides[fotomatonCurrentSlide];
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = imageUrl.split('/').pop();
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
}

function openFotomatonFullscreen() {
    const modal = document.getElementById('fotomatonFullscreenModal');
    const image = document.getElementById('fotomatonFullscreenImage');
    const counter = document.querySelector('.fotomaton-fullscreen-counter');

    image.src = fotomatonSlides[fotomatonCurrentSlide];
    counter.textContent = `${fotomatonCurrentSlide + 1} / ${fotomatonSlides.length}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFotomatonFullscreen() {
    document.getElementById('fotomatonFullscreenModal').classList.remove('active');
    document.body.style.overflow = '';
}

function updateFotomatonFullscreen() {
    document.getElementById('fotomatonFullscreenImage').src = fotomatonSlides[fotomatonCurrentSlide];
    document.querySelector('.fotomaton-fullscreen-counter').textContent =
        `${fotomatonCurrentSlide + 1} / ${fotomatonSlides.length}`;
}

function nextFotomatonSlideFullscreen() {
    showFotomatonSlide(fotomatonCurrentSlide + 1);
    updateFotomatonFullscreen();
}

function prevFotomatonSlideFullscreen() {
    showFotomatonSlide(fotomatonCurrentSlide - 1);
    updateFotomatonFullscreen();
}

document.addEventListener('keydown', (event) => {
    const modal = document.getElementById('fotomatonFullscreenModal');
    if (!modal.classList.contains('active')) return;

    if (event.key === 'ArrowLeft') prevFotomatonSlideFullscreen();
    if (event.key === 'ArrowRight') nextFotomatonSlideFullscreen();
    if (event.key === 'Escape') closeFotomatonFullscreen();
});
