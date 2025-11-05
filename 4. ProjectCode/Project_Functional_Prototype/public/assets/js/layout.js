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
      { href: '/itinerary', label: 'Itinerario' }
    ];

    function buildHeader(){
      const h = document.createElement('header');
      h.className = 'site-header';
      const cf = document.createElement('div');
      cf.className = 'container-fluid';
      const h1 = document.createElement('h1');
      h1.textContent = 'Intelligent Travel Planner';
      const nav = document.createElement('nav');
      cf.appendChild(h1);
      cf.appendChild(nav);
      h.appendChild(cf);
      // Fill nav
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
      span.id = 'userArea'; span.style.marginLeft = '12px'; nav.appendChild(span);
      return h;
    }

    if (!header){
      header = buildHeader();
      // Insert at top of body
      if (body.firstChild) body.insertBefore(header, body.firstChild);
      else body.appendChild(header);
    } else {
      // Rebuild header content to a consistent structure
      // Extract existing title and nav if present
      let existingH1 = header.querySelector('h1');
      let existingNav = header.querySelector('nav');

      // Create new consistent container
      const cf = document.createElement('div');
      cf.className = 'container-fluid';

      // Ensure h1
      const h1 = existingH1 ? existingH1 : document.createElement('h1');
      if (!existingH1) h1.textContent = 'Intelligent Travel Planner';

      // Ensure nav element
      const nav = existingNav ? existingNav : document.createElement('nav');

      // Normalize nav contents: ensure standard links
      const existingHrefs = new Set(Array.from(nav.querySelectorAll('a')).map(a => a.getAttribute('href')));
      for (const l of links) {
        if (!existingHrefs.has(l.href)){
          const a = document.createElement('a');
          a.href = l.href; a.textContent = l.label; nav.appendChild(a);
        }
      }
      if (!nav.querySelector('a[href="/auth/login"]')){
        const a = document.createElement('a'); a.href = '/auth/login'; a.textContent = 'Login'; nav.appendChild(a);
      }
      if (!nav.querySelector('a[href="/auth/register"]')){
        const a = document.createElement('a'); a.href = '/auth/register'; a.textContent = 'Registro'; nav.appendChild(a);
      }
      if (!nav.querySelector('#userArea')){
        const span = document.createElement('span'); span.id = 'userArea'; span.style.marginLeft = '12px'; nav.appendChild(span);
      }

      // Replace header children with consistent structure
      header.innerHTML = '';
      cf.appendChild(h1);
      cf.appendChild(nav);
      header.appendChild(cf);
    }

    // Highlight active link
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const anchors = header.querySelectorAll('nav a[href]');
    anchors.forEach(a => {
      const href = a.getAttribute('href');
      if(!href) return;
      const normalized = href.replace(/\/$/, '');
      if(normalized === currentPath){
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ensureHeader);
  } else {
    ensureHeader();
  }
})();
