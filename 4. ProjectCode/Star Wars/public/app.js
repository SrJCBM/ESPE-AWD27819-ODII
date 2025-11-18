const api = () => window.API_BASE || './api/starships.php';
const LY = window.LY_PER_PARSEC || 3.26;

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

function toast(msg, ms = 2000){
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  setTimeout(() => t.hidden = true, ms);
}

function computeLy(v){
  const n = parseFloat(v || 0);
  return (n * LY).toFixed(2);
}

function renderRows(items){
  const tbody = $('#rows');
  tbody.innerHTML = '';
  for(const s of items){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.model}</td>
      <td>${s.manufacturer}</td>
      <td>${s.hyperdriveRating}</td>
      <td>${s.maxDistanceParsec}</td>
      <td>${s.maxDistanceLy}</td>
    `;
    tbody.appendChild(tr);
  }
}

async function loadAll(){
  const res = await fetch(api());
  const data = await res.json();
  renderRows(data);
}

async function searchByName(name){
  const url = new URL(api(), window.location.href);
  url.searchParams.set('name', name);
  const res = await fetch(url);
  const data = await res.json();
  renderRows(data);
}

async function addStarship(payload){
  const res = await fetch(api(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if(!res.ok){
    const err = await res.json().catch(() => ({error:'Request failed'}));
    throw new Error(err.error || 'Request failed');
  }
  const data = await res.json();
  return data;
}

function bind(){
  const form = $('#shipForm');
  const parsecs = $('#parsecs');
  const lyOut = $('#lightYears');
  const btnAdd = $('#btnAdd');

  parsecs.addEventListener('input', () => {
    lyOut.value = computeLy(parsecs.value);
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.maxDistanceParsec = parseFloat(payload.maxDistanceParsec);
    payload.hyperdriveRating = parseFloat(payload.hyperdriveRating);
    try{
      btnAdd.disabled = true;
      await addStarship(payload);
      toast('Starship added');
      form.reset();
      lyOut.value = '0.00';
      await loadAll();
    }catch(err){
      toast(err.message || 'Failed to add');
    }finally{
      btnAdd.disabled = false;
    }
  });

  $('#btnLoad').addEventListener('click', loadAll);
  $('#btnSearch').addEventListener('click', () => {
    const q = $('#searchName').value.trim();
    if(q){ searchByName(q); } else { loadAll(); }
  });
  $('#btnReset').addEventListener('click', () => {
    $('#searchName').value = '';
    loadAll();
  });

  // Initial load
  loadAll();
}

document.addEventListener('DOMContentLoaded', bind);
