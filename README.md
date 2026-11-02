# Frontend Login Parqueo

Interfaz web de autenticación (Iniciar Sesión y Registro) conectada a la API de Login Parqueo (`https://apilogin-qh0o.onrender.com`).

## Estructura de Archivos
- `index.html`: Estructura principal con pestañas de **Iniciar Sesión** y **Registrarse**.
- `styles.css`: Estilos de la interfaz.
- `app.js`: Lógica de conexión mediante `fetch` a `/api/login` y `/api/registro` enviando el header `x-api-key`.
- `vercel.json`: Configuración de despliegue estático para Vercel.
