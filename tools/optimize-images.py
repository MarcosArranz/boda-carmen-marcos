"""
Genera versiones optimizadas de todas las fotos de la web.

Para cada imagen original crea:
  <carpeta>/thumbs/<nombre>.webp  -> miniatura para las cuadrículas (máx. 480 px)
  <carpeta>/large/<nombre>.webp   -> versión para carrusel / pantalla completa (máx. 1600 px)
  <carpeta>/jpg/<nombre>.jpg      -> versión JPG 1600 px para la descarga en ZIP

Los originales NO se modifican: la web funciona igual si falta algún derivado y
cada foto se puede descargar suelta en calidad original.

Uso:
    python tools/optimize-images.py            # procesa todo (omite lo ya hecho)
    python tools/optimize-images.py --force    # regenera todo
"""

import os
import sys
import time
from concurrent.futures import ProcessPoolExecutor

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Variante -> (lado máximo, calidad, método WebP, extensión, formato)
VARIANTS = {
    "thumbs": (480, 72, 6, ".webp", "WEBP"),
    "large": (1600, 78, 4, ".webp", "WEBP"),
    "jpg": (1600, 90, None, ".jpg", "JPEG"),
}

FOLDERS = ("FOTOMATON", "ONCE", "FOTOGRAFA DEFINITIVO", "images")

EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def load_image(path, max_side):
    """Abre la imagen y la decodifica al tamaño más pequeño posible (rápido)."""
    with Image.open(path) as img:
        try:
            # draft() acelera muchísimo la decodificación de JPEG grandes.
            img.draft("RGB", (max_side, max_side))
        except Exception:
            pass
        img = ImageOps.exif_transpose(img)
        if img.mode in ("RGBA", "LA", "P"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            img = img.convert("RGBA")
            background.paste(img, mask=img.split()[-1])
            img = background
        else:
            img = img.convert("RGB")
        img.thumbnail((max_side, max_side), Image.LANCZOS)
        return img


def process_file(src_path, folder, force):
    name = os.path.splitext(os.path.basename(src_path))[0]
    results = []

    for variant, (max_side, quality, method, ext, fmt) in VARIANTS.items():
        dst_dir = os.path.join(ROOT, folder, variant)
        dst_path = os.path.join(dst_dir, name + ext)

        if not force and os.path.exists(dst_path):
            if os.path.getmtime(dst_path) >= os.path.getmtime(src_path):
                results.append((dst_path, os.path.getsize(dst_path), True))
                continue

        img = load_image(src_path, max_side)
        os.makedirs(dst_dir, exist_ok=True)

        if fmt == "WEBP":
            img.save(dst_path, "WEBP", quality=quality, method=method, optimize=True)
        else:
            img.save(dst_path, "JPEG", quality=quality, optimize=True, progressive=True)

        results.append((dst_path, os.path.getsize(dst_path), False))

    return results


def collect_jobs():
    jobs = []
    for folder in FOLDERS:
        folder_path = os.path.join(ROOT, folder)
        if not os.path.isdir(folder_path):
            continue
        for entry in os.scandir(folder_path):
            if entry.is_file() and os.path.splitext(entry.name)[1].lower() in EXTENSIONS:
                jobs.append((entry.path, folder))
    return jobs


def main():
    force = "--force" in sys.argv
    jobs = collect_jobs()
    print(f"Imágenes a procesar: {len(jobs)}")

    start = time.time()
    total_out = 0
    created = 0
    done = 0

    with ProcessPoolExecutor(max_workers=os.cpu_count() or 4) as executor:
        futures = [
            executor.submit(process_file, src, folder, force) for src, folder in jobs
        ]
        for future in futures:
            for _path, size, existed in future.result():
                total_out += size
                if not existed:
                    created += 1
            done += 1
            if done % 50 == 0 or done == len(jobs):
                print(f"  {done}/{len(jobs)} ({time.time() - start:.0f}s)")

    print(
        f"Listo: {created} archivos nuevos, "
        f"{total_out / 1024 / 1024:.1f} MB de derivados, "
        f"{time.time() - start:.0f}s"
    )


if __name__ == "__main__":
    main()
