# 🔐 Configuración de Google Sign-In

## Estado Actual
Google Sign-In está **temporalmente deshabilitado** debido a errores de configuración de origins.

## Errores Identificados
```
❌ The given origin is not allowed for the given client ID
❌ Failed to load resource: 403
❌ CORS headers incorrectos
```

## Solución: Configurar Origins Autorizados

### Paso 1: Acceder a Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Inicia sesión con la cuenta propietaria del proyecto
3. Selecciona tu proyecto (o créalo si no existe)

### Paso 2: Configurar OAuth 2.0 Client ID
1. En la sección **Credentials**, busca tu Client ID:
   ```
   713160370468-sb3jjg16idaaakn3n6fe870nu6cn2h4b.apps.googleusercontent.com
   ```
2. Haz clic en el **ícono de edición** (lápiz)

### Paso 3: Agregar Orígenes Autorizados (Authorized JavaScript origins)
Agrega las siguientes URLs:

**Para desarrollo local:**
```
http://localhost:3000
http://127.0.0.1:3000
http://localhost:8000
http://127.0.0.1:8000
```

**Para producción:**
```
https://travel-brain-1.onrender.com
https://tu-dominio-personalizado.com  (si aplica)
```

### Paso 4: Configurar URIs de Redirección (Authorized redirect URIs)
Agrega:
```
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
https://travel-brain-1.onrender.com/auth/callback
```

### Paso 5: Guardar Cambios
⚠️ **Importante**: Los cambios pueden tardar hasta 5 minutos en propagarse.

## Habilitar Google Sign-In en el Código

### Paso 1: Descomentar el Script en login.html
En `src/views/auth/login.html`, descomenta:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### Paso 2: Descomentar el Botón
Descomenta:
```html
<div id="buttonDiv"></div>
<div class="divider"><span></span></div>
```

### Paso 3: Descomentar el Script de Inicialización
Descomenta todo el bloque de script al final del archivo.

## Implementar Backend para Google Sign-In

Actualmente solo se recibe el token en frontend. Necesitas:

### 1. Crear endpoint de validación
```php
// AuthController.php
public function googleLogin($request, $response) {
    $token = $request->body('credential');
    
    // Validar token con Google
    $client = new Google_Client(['client_id' => GOOGLE_CLIENT_ID]);
    $payload = $client->verifyIdToken($token);
    
    if ($payload) {
        $email = $payload['email'];
        $name = $payload['name'];
        $googleId = $payload['sub'];
        
        // Buscar o crear usuario
        // Crear sesión
        // Retornar respuesta
    }
}
```

### 2. Actualizar handleCredentialResponse
```javascript
function handleCredentialResponse(response) {
    fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential: response.credential })
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            window.location.href = '/';
        }
    });
}
```

## Verificación

### Comprobar que funciona:
1. Abre la consola del navegador (F12)
2. Ve a `/auth/login`
3. **No deberías ver**:
   - ❌ Errores 403
   - ❌ Errores de CORS
   - ❌ "Origin not allowed"
4. **Deberías ver**:
   - ✅ Botón de Google Sign-In renderizado
   - ✅ Sin errores en consola

## Alternativa: Deshabilitar Permanentemente

Si no necesitas Google Sign-In, puedes eliminar completamente:
1. El script de carga del SDK
2. El div `buttonDiv`
3. El código de inicialización
4. Las referencias en CSS (si existen)

## Recursos
- [Google Identity Services](https://developers.google.com/identity/gsi/web/guides/overview)
- [Configure OAuth 2.0](https://support.google.com/cloud/answer/6158849)
- [Troubleshoot origin errors](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#origin_error)
