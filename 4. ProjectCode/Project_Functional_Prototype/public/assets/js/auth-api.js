const api = async (url, opts = {}) => {
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.msg || `HTTP ${res.status}`);
  return data;
};

window.Auth = {
  register: (payload) => api('/api/auth/register', { method: 'POST', body: payload }),
  login:    (payload) => api('/api/auth/login',    { method: 'POST', body: payload }),
  me:       ()        => api('/api/auth/me'),
  logout:   ()        => api('/api/auth/logout',   { method: 'POST' })
};

// UI helpers to reflect auth state in header
(function(){
  function q(sel){ return document.querySelector(sel); }
  const HIDDEN_CLASS = 'nav-link--hidden';
  const LOCKED_CLASS = 'nav-link--locked';

  function setLinkHidden(link, hidden){
    if (!link) return;
    link.classList.toggle(HIDDEN_CLASS, hidden);
    if (hidden) {
      link.setAttribute('aria-hidden', 'true');
    } else {
      link.removeAttribute('aria-hidden');
    }
  }

  function setProtectedState(nav, hrefs, isAuthenticated){
    if (!nav) return;
    for (const href of hrefs){
      const el = nav.querySelector(`a[href="${href}"]`);
      if (!el) continue;
      el.classList.toggle(LOCKED_CLASS, !isAuthenticated);
      if (!isAuthenticated){
        if (!el.__lockHandler){
          el.__lockHandler = (ev) => {
            ev.preventDefault();
            window.location.href = '/auth/login';
          };
        }
        el.addEventListener('click', el.__lockHandler);
        el.setAttribute('aria-disabled', 'true');
        if (!el.dataset.lockedTitle){
          el.dataset.lockedTitle = el.getAttribute('title') || '';
        }
        el.setAttribute('title', 'Inicia sesión para acceder');
      } else if (el.__lockHandler){
        el.removeEventListener('click', el.__lockHandler);
        delete el.__lockHandler;
        el.removeAttribute('aria-disabled');
        if (el.dataset.lockedTitle !== undefined){
          if (el.dataset.lockedTitle) {
            el.setAttribute('title', el.dataset.lockedTitle);
          } else {
            el.removeAttribute('title');
          }
          delete el.dataset.lockedTitle;
        }
      }
    }
  }

  async function renderUserArea(){
    const slot = document.getElementById('userArea');
    const loginLink = q('nav a[href="/auth/login"]');
    const registerLink = q('nav a[href="/auth/register"]');
    const nav = document.querySelector('header.site-header nav');
    if (!slot) return;
    const protectedHrefs = ['/destinations','/trips','/budget','/itinerary'];

    const updateProtectedLinks = (loggedIn) => setProtectedState(nav, protectedHrefs, loggedIn);

    try{
      const res = await (globalThis.Auth ? globalThis.Auth.me() : Promise.reject(new Error('Auth not available')));
      if (res?.ok){
        const user = res.user || {};
        const displayName = user.name || user.username || 'Usuario';
        slot.innerHTML = ` ${displayName} · <a href="#" id="logoutLink">Salir</a>`;
        setLinkHidden(loginLink, true);
        setLinkHidden(registerLink, true);
        updateProtectedLinks(true);
        if (nav){
          const adminHref = '/admin/users';
          let adminLink = nav.querySelector(`a[href="${adminHref}"]`);
          if (String(user.role).toUpperCase() === 'ADMIN'){
            if (adminLink == null){
              adminLink = document.createElement('a');
              adminLink.href = adminHref; adminLink.textContent = 'Usuarios';
              slot.before(adminLink);
            } else {
              adminLink.style.display = '';
            }
          } else if (adminLink){
            adminLink.style.display = 'none';
          }
        }
        const logoutEl = document.getElementById('logoutLink');
        if (logoutEl){
          logoutEl.addEventListener('click', async (e)=>{
            e.preventDefault();
            try { await globalThis.Auth.logout(); }
            catch(err){ console.warn('Logout error (ignored):', err); }
            await renderUserArea();
            globalThis.location.href = '/';
          });
        }
      } else {
        slot.innerHTML = '';
        setLinkHidden(loginLink, false);
        setLinkHidden(registerLink, false);
        updateProtectedLinks(false);
        if (nav){
          const adminLink = nav.querySelector('a[href="/admin/users"]');
          if (adminLink) adminLink.style.display = 'none';
        }
      }
    }catch(err){
      console.warn('Auth status check failed:', err);
      slot.innerHTML = '';
      setLinkHidden(loginLink, false);
      setLinkHidden(registerLink, false);
      const navElement = document.querySelector('header.site-header nav');
      if (navElement){
        const adminLink = navElement.querySelector('a[href="/admin/users"]');
        if (adminLink) adminLink.style.display = 'none';
      }
      updateProtectedLinks(false);
    }
  }

  if (!globalThis.Auth) { globalThis.Auth = {}; }
  globalThis.Auth.renderUserArea = renderUserArea;

  document.addEventListener('DOMContentLoaded', ()=>{
    if (document.getElementById('userArea')){
      renderUserArea();
    }
  });
})();
