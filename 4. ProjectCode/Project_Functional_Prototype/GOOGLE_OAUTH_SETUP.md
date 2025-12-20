# 🔐 Configuración de Google OAuth - Travel Brain

## ✅ Estado de la Implementación

### Completado:
- ✅ Dependencias instaladas (google-auth-library, jsonwebtoken, dotenv)
- ✅ Modelo de usuarios actualizado para soportar Google OAuth
- ✅ Ruta `/api/auth/google-login` creada en routes/authRoutes.js
- ✅ Frontend actualizado (login.html y auth-login.js)
- ✅ Variables de entorno configuradas (.env)
- ✅ Servidor funcionando correctamente en puerto 3004

### Falta configurar:
- ⚠️ **Google Cloud Console** (ver instrucciones abajo)

---

## 📋 Configuración de Google Cloud Console

### Paso 1: Acceder a Google Cloud Console
1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta de Google
3. Selecciona tu proyecto (o crea uno nuevo)

### Paso 2: Habilitar Google Sign-In API
1. En el menú lateral, ve a **"APIs y servicios"** > **"Biblioteca"**
2. Busca **"Google Sign-In API"** o **"Google+ API"**
3. Haz clic en **"Habilitar"**

### Paso 3: Configurar OAuth Consent Screen
1. Ve a **"APIs y servicios"** > **"Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externo"** y haz clic en **"Crear"**
3. Completa la información:
   - **Nombre de la aplicación:** Travel Brain
   - **Correo de asistencia:** tu-email@ejemplo.com
   - **Dominios autorizados:** (déjalo vacío por ahora)
   - **Correo del desarrollador:** tu-email@ejemplo.com
4. Guarda y continúa

### Paso 4: Configurar Credenciales OAuth 2.0
1. Ve a **"APIs y servicios"** > **"Credenciales"**
2. Busca tu Client ID existente: `713160370468-sb3jjg16idaaakn3n6fe870nu6cn2h4b`
3. Haz clic en el nombre para editarlo

### Paso 5: Agregar Orígenes Autorizados

#### Orígenes de JavaScript autorizados:
```
http://localhost:8000
https://travelbrain-3tfv.onrender.com
```

#### URIs de redirección autorizados:
```
http://localhost:8000
https://travelbrain-3tfv.onrender.com
```

⚠️ **IMPORTANTE:** 
- NO incluyas `/` al final de las URLs
- Usa puerto **8000** para desarrollo (PHP), no 3004

### Paso 6: Guardar Cambios
1. Haz clic en **"Guardar"**
2. Espera 5-10 minutos para que los cambios se propaguen

---

## 🧪 Probar Google OAuth

### En Desarrollo (localhost):

**IMPORTANTE:** Tu aplicación usa 2 servidores:
- **Node.js (puerto 3004)**: APIs y MongoDB
- **PHP (puerto 8000)**: Frontend y sesiones

#### Opción 1: Usar script automático (Recomendado)
```bash
.\start-servers.bat
```

#### Opción 2: Iniciar manualmente
Terminal 1:
```bash
node index.js
```

Terminal 2:
```bash
php -S localhost:8000 -t public public/index.php
```

#### Probar OAuth:
1. Abre en el navegador: **http://localhost:8000/auth/login**
2. Haz clic en el botón **"Sign in with Google"**
3. Selecciona tu cuenta de Google
4. Deberías ser redirigido a la página principal autenticado

### Nota sobre errores en la consola:
- El error de Content Security Policy `.well-known/appspecific` es **normal** y viene de Chrome DevTools, no afecta la funcionalidad
- Ignora ese error, es solo un intento de Chrome de conectarse a sus herramientas de desarrollo

### En Producción (Render):
1. Despliega la aplicación en Render
2. Asegúrate de que las variables de entorno estén configuradas en Render:
   - `JWT_SECRET` (usa la misma clave del .env)
   - `GOOGLE_CLIENT_ID`
   - `NODE_ENV=production`
   - `BASE_URL=https://travelbrain-3tfv.onrender.com`
3. Abre: https://travelbrain-3tfv.onrender.com/auth/login

---

## 🔍 Solución de Problemas

### Error: "Invalid audience"
- **Causa:** El Client ID en el HTML no coincide con el de Google Console
- **Solución:** Verifica que el Client ID sea el correcto

### Error: "Not a valid origin for the client"
- **Causa:** El dominio no está autorizado en Google Console
- **Solución:** Agrega el dominio en "Orígenes de JavaScript autorizados"

### El botón de Google no aparece
- **Causa:** El script de Google no se cargó correctamente
- **Solución:** Verifica tu conexión a internet y abre la consola del navegador

### Error 401 en /api/auth/google-login
- **Causa:** El token de Google no es válido o expiró
- **Solución:** Intenta cerrar sesión y volver a iniciar

---

## 📁 Archivos Modificados

### Backend:
- `models/users.js` - Agregados campos `googleId` y `picture`
- `routes/authRoutes.js` - Nueva ruta de Google OAuth
- `index.js` - Agregada carga de variables de entorno y ruta de autenticación
- `package.json` - Agregadas dependencias de OAuth

### Frontend:
- `src/views/auth/login.html` - Eliminado mensaje de "OAuth deshabilitado"
- `public/assets/js/auth-login.js` - Agregada función `handleCredentialResponse`

### Configuración:
- `.env` - Variables de entorno (JWT_SECRET, GOOGLE_CLIENT_ID, etc.)
- `.env.example` - Ejemplo de configuración

---

## 🔒 Seguridad

### ¡IMPORTANTE! Nunca compartas:
- ❌ El archivo `.env` (ya está en .gitignore)
- ❌ La clave `JWT_SECRET`
- ❌ Las credenciales de MongoDB

### En Producción:
- ✅ Usa una clave JWT diferente
- ✅ Usa HTTPS siempre
- ✅ Configura CORS apropiadamente
- ✅ Limita los dominios autorizados en Google Console

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor
3. Verifica que Google Console esté configurado correctamente
4. Espera unos minutos después de hacer cambios en Google Console

---

**¡Listo!** Google OAuth está completamente configurado. Solo falta configurar Google Cloud Console y estará funcionando. 🎉
