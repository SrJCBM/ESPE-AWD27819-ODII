// Configuración de la aplicación
window.AppConfig = {
    // Configuración de APIs
    geminiApiKey: localStorage.getItem('gemini_api_key') || null,
    
    // Configurar API key de Gemini
    setGeminiApiKey: function(key) {
        if (!key || typeof key !== 'string' || key.trim().length < 10) {
            throw new Error('API key inválida');
        }
        
        this.geminiApiKey = key;
        localStorage.setItem('gemini_api_key', key);
        
        // Reinicializar la conexión con Gemini
        if (window.GeminiTravelAPI) {
            window.GeminiTravelAPI.reinitialize(key);
        }

        return true;
    },
    
    // Obtener API key de Gemini
    getGeminiApiKey: function() {
        return this.geminiApiKey;
    },
    
    // Verificar si Gemini está configurado
    hasGeminiKey: function() {
        return this.geminiApiKey && this.geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE';
    }
};

// Mostrar notificación si no hay API key configurada
document.addEventListener('DOMContentLoaded', function() {
    if (!window.AppConfig.hasGeminiKey()) {
        console.warn('API Key de Gemini no configurada. Usando modo simulado.');
        
        // Mostrar mensaje en páginas de itinerario
        if (window.location.pathname.includes('itinerary')) {
            setTimeout(() => {
                const notice = document.createElement('div');
                notice.className = 'api-notice';
                notice.innerHTML = `
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 1rem; border-radius: 8px; margin: 1rem 0; color: #856404;">
                        <strong>💡 Consejo:</strong> Para obtener itinerarios más detallados y personalizados, 
                        <a href="#" onclick="promptForApiKey()" style="color: #856404; text-decoration: underline;">
                            configura tu API key de Gemini
                        </a>
                    </div>
                `;
                
                const container = document.querySelector('.container');
                if (container) {
                    container.insertBefore(notice, container.firstChild);
                }
            }, 1000);
        }
    }
});

// Función para solicitar API key
window.promptForApiKey = function() {
    const key = prompt(`Para usar la IA de Google Gemini, necesitas una API key gratuita:

1. Ve a https://makersuite.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API key
4. Copia y pega la key aquí

Ingresa tu API key de Gemini:`);
    
    if (key && key.trim()) {
        window.AppConfig.setGeminiApiKey(key.trim());
        alert('¡API key configurada! Ahora puedes generar itinerarios más detallados.');
        
        // Recargar la página para aplicar cambios
        window.location.reload();
    }
};