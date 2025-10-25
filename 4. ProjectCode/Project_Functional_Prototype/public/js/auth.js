(function(){
	const AUTH_KEY = 'tp_user';
	const USERS_KEY = 'tp_users';

	function getUser(){ try{ return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }catch(e){ return null; } }
	function setUser(u){ localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }
	function clearUser(){ localStorage.removeItem(AUTH_KEY); }

	function getUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }catch(e){ return []; } }
	function saveUsers(u){ localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

	function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

	// Registro: evalúa unicidad de usuario y guarda credenciales básicas (prototipo)
	function register({ username, password }){
		username = (username||'').trim();
		password = (password||'').trim();
		if(!username || !password) return { ok:false, msg: 'Usuario y contraseña requeridos' };
		const users = getUsers();
		if(users.find(u=>u.username.toLowerCase()===username.toLowerCase())) return { ok:false, msg: 'Usuario ya existe' };
		users.push({ username, password });
		saveUsers(users);
		// auto-login tras registro
		setUser({ username });
		return { ok:true };
	}

	// Login: comprueba credenciales
	function login({ username, password }){
		username = (username||'').trim();
		password = (password||'').trim();
		if(!username || !password) return { ok:false, msg: 'Usuario y contraseña requeridos' };
		const users = getUsers();
		const u = users.find(x=>x.username===username && x.password===password);
		if(!u) return { ok:false, msg: 'Credenciales inválidas' };
		setUser({ username: u.username });
		return { ok:true };
	}

	function logout(){
		clearUser();
		renderUserArea();
	}

	// renderiza el área de usuario en la esquina superior derecha
	function renderUserArea(){
		const el = document.getElementById('userArea');
		const user = getUser();
		if(!el) return;
		if(user){
			el.innerHTML = `<span class="user-greet">Hola, <strong>${escapeHtml(user.username)}</strong></span>
				<button id="logoutBtn" class="btn-link">Cerrar sesión</button>`;
			const btn = document.getElementById('logoutBtn');
			if(btn) btn.addEventListener('click', () => { logout(); });
		} else {
			el.innerHTML = `<button id="authBtn" class="btn-primary">Entrar / Registrarse</button>`;
			const b = document.getElementById('authBtn');
			if(b) b.addEventListener('click', ()=> { location.href = './public/login.html'; });
		}
	}

	// Exponer API pública
	window.Auth = {
		register,
		login,
		logout,
		getUser,
		renderUserArea,
		getUsers
	};

	// Al cargar la página solo renderizar el área de usuario; no redirigir automáticamente.
	document.addEventListener('DOMContentLoaded', () => {
		renderUserArea();
	});
})();
