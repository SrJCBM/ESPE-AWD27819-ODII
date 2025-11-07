// public/assets/js/layout.js
(function(){
  function ensureHeader(){
    const body = document.body;
    let header = document.querySelector('.site-header');

    // Build standard nav links
    const links = [
      { href: '/', label: '🏠 Inicio' },
      { href: '/destinations', label: 'Destinos' },
      { href: '/trips', label: 'Viajes' },
      { href: '/routes', label: 'Rutas' },
      { href: '/weather', label: 'Clima' },
      { href: '/budget', label: 'Presupuesto' },
      { href: '/currency', label: 'Conversor' },
      { href: '/itinerary', label: 'Itinerario' }
    ];

    function buildHeader(){
      const h = document.createElement('header');
      h.className = 'site-header';
      h.innerHTML = `
        <div class="container-fluid">
          <h1>Intelligent Travel Planner</h1>
          <nav></nav>
        </div>
      `;
      const nav = h.querySelector('nav');
      for (const l of links) {
        const a = document.createElement('a');
        a.href = l.href; a.textContent = l.label; nav.appendChild(a);
      }
      // Auth links + user area
      const aLogin = document.createElement('a');
      aLogin.href = '/auth/login'; aLogin.textContent = 'Login'; nav.appendChild(aLogin);
      const aReg = document.createElement('a');
      aReg.href = '/auth/register'; aReg.textContent = 'Registro'; nav.appendChild(aReg);
      const span = document.createElement('span');
      span.id = 'userArea';
      nav.appendChild(span);
      return h;
    }

    if (!header){
      header = buildHeader();
      // Insert at top of body
      if (body.firstChild) body.insertBefore(header, body.firstChild);
      else body.appendChild(header);
    } else {
      let nav = header.querySelector('nav');
      if (!nav){
        nav = document.createElement('nav');
        header.appendChild(nav);
      }

      const existingUserArea = nav.querySelector('#userArea');
      const userAreaContent = existingUserArea ? existingUserArea.innerHTML : '';

      nav.innerHTML = '';

      for (const l of links) {
        const a = document.createElement('a');
        a.href = l.href;
        a.textContent = l.label;
        nav.appendChild(a);
      }

      const loginLink = document.createElement('a');
      loginLink.href = '/auth/login';
      loginLink.textContent = 'Login';
      nav.appendChild(loginLink);

      const registerLink = document.createElement('a');
      registerLink.href = '/auth/register';
      registerLink.textContent = 'Registro';
      nav.appendChild(registerLink);

      const userArea = document.createElement('span');
      userArea.id = 'userArea';
      userArea.innerHTML = userAreaContent;
      nav.appendChild(userArea);
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ensureHeader);
  } else {
    ensureHeader();
  }
})();
