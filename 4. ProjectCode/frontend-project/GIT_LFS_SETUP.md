# 🎬 Configuración de Git LFS para Video

## ✅ Archivo .gitattributes creado

Ya está configurado para que todos los archivos `.mp4` usen Git LFS automáticamente.

## 📋 Pasos para usar Git LFS:

### 1️⃣ Instalar Git LFS

**Windows:**
```bash
# Opción A - Descarga directa
# Ir a: https://git-lfs.github.com/
# Descargar e instalar el ejecutable

# Opción B - Con Git for Windows (si ya lo tienes)
# Git LFS ya viene incluido con Git for Windows 2.x
git lfs version
```

**Si no está instalado:**
1. Ve a https://git-lfs.github.com/
2. Descarga "Download for Windows"
3. Ejecuta el instalador
4. Reinicia tu terminal

### 2️⃣ Inicializar Git LFS en tu repositorio

```bash
cd "c:\Users\patri\OneDrive\Escritorio\ESPE-AWD27819-ODII"

# Inicializar Git LFS (solo una vez)
git lfs install

# Verificar que .gitattributes está configurado
git lfs track "*.mp4"
```

### 3️⃣ Colocar tu video

Coloca tu archivo `videoplayback.mp4` en:
```
4. ProjectCode\frontend-project\public\assets\videos\videoplayback.mp4
```

### 4️⃣ Agregar y commitear

```bash
# Verificar el estado
git lfs status

# Agregar el video
git add "4. ProjectCode/frontend-project/public/assets/videos/videoplayback.mp4"

# Verificar que Git LFS lo detectó
git lfs ls-files

# Hacer commit
git commit -m "Add video with Git LFS"

# Subir a GitHub
git push origin main
```

## 🎯 Verificaciones:

### ✅ Verificar que Git LFS funciona:
```bash
# Ver archivos rastreados por LFS
git lfs ls-files

# Ver el tamaño real del video
git lfs ls-files --size

# Ver el estado de LFS
git lfs status
```

### ✅ Si el video ya estaba agregado (sin LFS):
```bash
# Eliminar del historial
git rm --cached "4. ProjectCode/frontend-project/public/assets/videos/videoplayback.mp4"

# Agregar de nuevo (ahora con LFS)
git add "4. ProjectCode/frontend-project/public/assets/videos/videoplayback.mp4"

# Commit
git commit -m "Migrate video to Git LFS"

# Push
git push origin main
```

## 📊 Límites de Git LFS en GitHub:

- **Gratis**: 1 GB de almacenamiento, 1 GB de ancho de banda/mes
- **Paquetes**: $5/mes por 50 GB adicionales
- **Tamaño máximo por archivo**: 2 GB (GitHub Free), 5 GB (Pro)

## 💡 Consejos:

1. **Si tu video es muy grande** (>100MB):
   - Considera comprimirlo antes
   - O usa un servicio de video como YouTube/Vimeo (gratis)

2. **Para comprimir el video**:
   - Usa Handbrake (gratis): https://handbrake.fr/
   - O FFmpeg: `ffmpeg -i input.mp4 -vcodec libx264 -crf 28 output.mp4`

3. **Alternativas a Git LFS**:
   - YouTube (unlisted video)
   - Vimeo
   - Cloudinary (gratis 25GB)
   - Bunny CDN

## 🚀 Resumen Rápido:

```bash
# 1. Instalar Git LFS (si no lo tienes)
git lfs version

# 2. Inicializar en tu repo
cd "c:\Users\patri\OneDrive\Escritorio\ESPE-AWD27819-ODII"
git lfs install

# 3. Colocar video en la carpeta
# 4. ProjectCode\frontend-project\public\assets\videos\videoplayback.mp4

# 4. Agregar y subir
git add .gitattributes
git add "4. ProjectCode/frontend-project/public/assets/videos/videoplayback.mp4"
git commit -m "Add video with Git LFS"
git push origin main
```

¡Listo! Tu video estará en GitHub con Git LFS y no afectará el rendimiento del repositorio.
