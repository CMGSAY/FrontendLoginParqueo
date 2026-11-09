const API_URL = 'https://apilogin-qh0o.onrender.com';
const API_KEY = 'LoginParqueo_2026_JVC_KEY';
const PARQUEO_APP_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://parqueo-fronted.vercel.app';

const tabLogin = document.getElementById('tabLogin');
const tabRegistro = document.getElementById('tabRegistro');
const vistaLogin = document.getElementById('vistaLogin');
const vistaRegistro = document.getElementById('vistaRegistro');
const alertaBox = document.getElementById('alertaBox');

const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const btnSubmitLogin = document.getElementById('btnSubmitLogin');
const btnSubmitRegistro = document.getElementById('btnSubmitRegistro');

// Cambiar entre pestaña de Login y Registro
function cambiarVista(vista) {
  alertaBox.classList.add('hidden');

  if (vista === 'login') {
    vistaLogin.classList.remove('hidden');
    vistaRegistro.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegistro.classList.remove('active');
  } else {
    vistaRegistro.classList.remove('hidden');
    vistaLogin.classList.add('hidden');
    tabRegistro.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

tabLogin.addEventListener('click', () => cambiarVista('login'));
tabRegistro.addEventListener('click', () => cambiarVista('registro'));

// Mostrar alerta de error o éxito
function mostrarAlerta(mensaje, tipo) {
  alertaBox.textContent = mensaje;
  alertaBox.classList.remove('hidden', 'alert-error', 'alert-success');
  alertaBox.classList.add(tipo === 'exito' ? 'alert-success' : 'alert-error');
}

// POST /api/login
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertaBox.classList.add('hidden');

  const correo = document.getElementById('loginCorreo').value.trim();
  const password = document.getElementById('loginPassword').value;

  btnSubmitLogin.disabled = true;
  btnSubmitLogin.textContent = 'Cargando...';

  try {
    const respuesta = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ correo, password })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      const msg = datos.detalle ? `${datos.mensaje}: ${datos.detalle}` : (datos.mensaje || 'Error al iniciar sesión');
      mostrarAlerta(msg, 'error');
      return;
    }

    if (datos.token) {
      localStorage.setItem('token', datos.token);
      localStorage.setItem('umes_token', datos.token);
    }
    if (datos.usuario) {
      localStorage.setItem('usuario', JSON.stringify(datos.usuario));
    }

    // Sincronizar usuario en parqueos-api antes de redirigir (keepalive evita que se cancele al cambiar de página)
    await Promise.race([
      fetch('https://parqueos-api.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password }),
        keepalive: true
      }).catch(() => null),
      new Promise((resolve) => setTimeout(resolve, 2000))
    ]);

    mostrarAlerta(
      `${datos.mensaje} — Bienvenido ${datos.usuario.nombre} (Rol: ${datos.usuario.rol}). Entrando al parqueo...`,
      'exito'
    );
    formLogin.reset();

    const token = datos.token || datos.access_token || '';
    const u = datos.usuario || {};
    const nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.trim() || 'Usuario';
    const params = new URLSearchParams({
      token,
      id: String(u.id || 1),
      correo: u.correo || correo,
      nombre: nombreCompleto,
      rol: String(u.rol || 1)
    });

    setTimeout(() => {
      window.location.href = `${PARQUEO_APP_URL}/login?${params.toString()}`;
    }, 800);
  } catch (error) {
    mostrarAlerta('Error de conexión con la API', 'error');
  } finally {
    btnSubmitLogin.disabled = false;
    btnSubmitLogin.textContent = 'Iniciar Sesión';
  }
});

// POST /api/registro
formRegistro.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertaBox.classList.add('hidden');

  const nombre = document.getElementById('regNombre').value.trim();
  const apellido = document.getElementById('regApellido').value.trim();
  const usuario = document.getElementById('regUsuario').value.trim();
  const correo = document.getElementById('regCorreo').value.trim();
  const password = document.getElementById('regPassword').value;

  btnSubmitRegistro.disabled = true;
  btnSubmitRegistro.textContent = 'Registrando...';

  try {
    const respuesta = await fetch(`${API_URL}/api/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ nombre, apellido, usuario, correo, password })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      const msg = datos.detalle ? `${datos.mensaje}: ${datos.detalle}` : (datos.mensaje || 'Error al registrar usuario');
      mostrarAlerta(msg, 'error');
      return;
    }

    formRegistro.reset();
    cambiarVista('login');
    mostrarAlerta(datos.mensaje || 'Usuario registrado exitosamente', 'exito');
  } catch (error) {
    mostrarAlerta('Error de conexión con la API', 'error');
  } finally {
    btnSubmitRegistro.disabled = false;
    btnSubmitRegistro.textContent = 'Registrarse';
  }
});
