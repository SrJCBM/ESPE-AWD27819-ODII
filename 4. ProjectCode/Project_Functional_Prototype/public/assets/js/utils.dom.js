// public/assets/js/utils.dom.js
// DOM & HTML utility helpers
(function(){
  function escapeHtml(text){
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
  }

  function qs(sel, parent=document){ return parent.querySelector(sel); }
  function qsa(sel, parent=document){ return Array.from(parent.querySelectorAll(sel)); }

  globalThis.DomUtils = { escapeHtml, qs, qsa };
})();
