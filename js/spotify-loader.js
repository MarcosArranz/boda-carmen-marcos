// Cargar canciones de Spotify usando API backend en Vercel
const TRACKS_CONTAINER = document.getElementById('spotify-tracks-list');

// En Neocities, cambiar esta URL por tu URL de Vercel
// Ejemplo: https://boda-carmen-marcos.vercel.app/api/spotify
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api/spotify'  // Para local
    : 'https://boda-carmen-marcos.vercel.app/api/spotify';  // Para producción

// Cargar la información de la playlist desde el servidor backend
async function loadPlaylist() {
    try {
        const response = await fetch(API_URL);
        
        if (response.ok) {
            const data = await response.json();
            displayPlaylist(data);
        } else {
            console.error('Error:', response.status);
            showPlaceholder();
        }
    } catch (error) {
        console.error('Error cargando playlist:', error);
        showPlaceholder();
    }
}

function displayPlaylist(playlist) {
    if (!TRACKS_CONTAINER) return;

    const image = playlist.images?.[0]?.url || '';
    const name = playlist.name || 'Playlist';
    const totalTracks = playlist.tracks?.total || 0;
    const items = playlist.tracks?.items || [];

    let html = `
        <div style="
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        ">
            <!-- Encabezado de la playlist -->
            <div style="
                background: linear-gradient(135deg, #8B4744 0%, #A76863 100%);
                padding: 2rem;
                text-align: center;
                color: white;
            ">
                ${image ? `<img src="${image}" alt="${name}" style="
                    width: 150px;
                    height: 150px;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                ">` : ''}
                <h3 style="margin: 1rem 0 0.5rem 0; font-size: 1.8rem;">${name}</h3>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; opacity: 0.8;">${totalTracks} ${totalTracks === 1 ? 'canción' : 'canciones'}</p>
            </div>

            <!-- Canciones -->
            <div style="max-height: 400px; overflow-y: auto;">
    `;

    if (!items || items.length === 0) {
        html += `
            <div style="text-align: center; padding: 2rem; color: #999;">
                <p style="margin: 0;">📭 Aún no hay canciones en la playlist</p>
            </div>
        `;
    } else {
        items.forEach((item, index) => {
            const track = item.track;
            if (!track) return;

            const trackName = track.name || 'Canción';
            const artist = track.artists?.[0]?.name || 'Artista desconocido';
            const duration = formatDuration(track.duration_ms);

            html += `
                <div style="
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.95rem;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#f9f9f9'" onmouseout="this.style.background='transparent'">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${index + 1}. ${trackName}
                        </div>
                        <div style="font-size: 0.85rem; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${artist}
                        </div>
                    </div>
                    <div style="color: #999; margin-left: 1rem; min-width: 45px; text-align: right; flex-shrink: 0;">
                        ${duration}
                    </div>
                </div>
            `;
        });
    }

    html += `
            </div>
        </div>
    `;

    TRACKS_CONTAINER.innerHTML = html;
}

function formatDuration(ms) {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.round((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function showPlaceholder() {
    if (TRACKS_CONTAINER) {
        TRACKS_CONTAINER.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                text-align: center;
                padding: 2rem;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            ">
                <p style="margin: 0.5rem 0; font-size: 1rem; color: #999;">📱 Abre Spotify para ver y añadir canciones</p>
                <p style="font-size: 0.9rem; margin: 0.5rem 0; color: #ccc;">Las canciones aparecerán aquí cuando se añadan</p>
            </div>
        `;
    }
}

// Cargar al abrir la página
window.addEventListener('load', loadPlaylist);

// También si el DOM ya está listo
if (document.readyState !== 'loading') {
    loadPlaylist();
}
