// Sistema de galería y subida de fotos
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const uploadBtn = document.getElementById('uploadBtn');
const galleryGrid = document.getElementById('galleryGrid');

// Array para almacenar las fotos seleccionadas
let selectedFiles = [gatos.jpeg];

// Cargar fotos guardadas al inicio
window.addEventListener('load', loadSavedPhotos);

// Evento para seleccionar archivos
fileInput.addEventListener('change', handleFileSelect);

// Drag and drop
const uploadBox = document.querySelector('.upload-box');

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.background = 'rgba(212, 175, 55, 0.1)';
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.background = '';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.background = '';
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    handleFiles(files);
});

// Manejar selección de archivos
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

// Procesar archivos seleccionados
function handleFiles(files) {
    files.forEach(file => {
        if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
            selectedFiles.push(file);
            createPreview(file);
        }
    });
    
    if (selectedFiles.length > 0) {
        uploadBtn.style.display = 'block';
    }
}

// Crear vista previa de la imagen
function createPreview(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <button class="remove-btn" onclick="removePreview(this, '${file.name}')">×</button>
        `;
        previewContainer.appendChild(previewItem);
    };
    
    reader.readAsDataURL(file);
}

// Eliminar vista previa
function removePreview(button, fileName) {
    const previewItem = button.parentElement;
    previewItem.remove();
    
    selectedFiles = selectedFiles.filter(f => f.name !== fileName);
    
    if (selectedFiles.length === 0) {
        uploadBtn.style.display = 'none';
    }
}

// Subir fotos (simulado - guardar en localStorage)
uploadBtn.addEventListener('click', uploadPhotos);

function uploadPhotos() {
    if (selectedFiles.length === 0) return;
    
    // Obtener fotos guardadas
    let savedPhotos = JSON.parse(localStorage.getItem('eventPhotos') || '[]');
    
    // Convertir archivos a base64 y guardar
    let processedCount = 0;
    
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            savedPhotos.push({
                data: e.target.result,
                name: file.name,
                date: new Date().toISOString()
            });
            
            processedCount++;
            
            // Cuando todas las fotos estén procesadas
            if (processedCount === selectedFiles.length) {
                // Guardar en localStorage
                localStorage.setItem('eventPhotos', JSON.stringify(savedPhotos));
                
                // Mostrar mensaje de éxito
                showUploadSuccess();
                
                // Limpiar selección
                selectedFiles = [];
                previewContainer.innerHTML = '';
                fileInput.value = '';
                uploadBtn.style.display = 'none';
                
                // Recargar galería
                loadSavedPhotos();
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// Mostrar mensaje de éxito
function showUploadSuccess() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideDown 0.3s ease;
    `;
    message.textContent = '✓ Fotos subidas correctamente';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Cargar fotos guardadas en la galería
function loadSavedPhotos() {
    const savedPhotos = JSON.parse(localStorage.getItem('eventPhotos') || '[]');
    
    if (savedPhotos.length === 0) {
        galleryGrid.innerHTML = `
            <div class="gallery-placeholder">
                <p>📸 Las fotos subidas por los invitados aparecerán aquí</p>
            </div>
        `;
        return;
    }
    
    galleryGrid.innerHTML = '';
    
    savedPhotos.forEach((photo, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `<img src="${photo.data}" alt="Foto del evento ${index + 1}">`;
        
        // Click para ver en grande
        galleryItem.addEventListener('click', () => openLightbox(photo.data));
        
        galleryGrid.appendChild(galleryItem);
    });
}

// Lightbox para ver fotos en grande
function openLightbox(imageSrc) {
    const lightbox = document.createElement('div');
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    `;
    
    lightbox.appendChild(img);
    document.body.appendChild(lightbox);
    
    lightbox.addEventListener('click', () => lightbox.remove());
}

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100px); opacity: 0; }
    }
`;
document.head.appendChild(style);
