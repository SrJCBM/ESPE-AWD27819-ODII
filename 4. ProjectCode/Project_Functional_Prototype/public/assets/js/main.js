window.app = (function(){
	const ls = {
		destKey: 'tp_destinations',
		tripKey: 'tp_trips',
		weatherKey: 'tp_weather',
		budgetKey: 'tp_budgets',
		itKey: 'tp_itineraries'
	};

	function uid(prefix = ''){ return prefix + Date.now() + Math.floor(Math.random()*1000); }
	function read(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){return []} }
	function write(key, v){ localStorage.setItem(key, JSON.stringify(v)); }

	// Destinations CRUD
	function getDestinations(){ return read(ls.destKey); }
	function saveDestination(d){
		const all = getDestinations();
		if(!d.id){ d.id = uid('dest_'); all.push(d); }
		else{
			const idx = all.findIndex(x=>x.id===d.id);
			if(idx>=0) all[idx] = d;
			else all.push(d);
		}
		write(ls.destKey, all);
		renderDestinations();
	}
	function deleteDestination(id){
		let all = getDestinations().filter(x=>x.id!==id);
		write(ls.destKey, all);
		renderDestinations();
	}

	// Trips CRUD
	function getTrips(){ return read(ls.tripKey); }
	function saveTrip(t){
		const all = getTrips();
		if(!t.id){ t.id = uid('trip_'); all.push(t); }
		else{
			const idx = all.findIndex(x=>x.id===t.id);
			if(idx>=0) all[idx] = t;
			else all.push(t);
		}
		write(ls.tripKey, all);
		renderTrips();
	}
	function deleteTrip(id){
		let all = getTrips().filter(x=>x.id!==id);
		write(ls.tripKey, all);
		renderTrips();
	}

	// Weather records
	function saveWeather(record){
		const arr = read(ls.weatherKey);
		record.id = uid('w_'); record.date = new Date().toISOString();
		arr.push(record); write(ls.weatherKey, arr);
	}

	// Budget / expenses
	function saveBudget(tripId, amount){
		const budgets = read(ls.budgetKey);
		const idx = budgets.findIndex(b=>b.tripId===tripId);
		if(idx>=0) budgets[idx].amount = amount;
		else budgets.push({ tripId, amount, expenses: [] });
		write(ls.budgetKey, budgets);
	}
	function addExpense(tripId, expense){
		const budgets = read(ls.budgetKey);
		let b = budgets.find(b=>b.tripId===tripId);
		if(!b){ b = { tripId, amount:0, expenses: [] }; budgets.push(b); }
		b.expenses.push({ id: uid('e_'), desc: expense.desc, amt: expense.amt });
		write(ls.budgetKey, budgets);
	}
	function getBudget(tripId){ return read(ls.budgetKey).find(b=>b.tripId===tripId) || { tripId, amount:0, expenses:[] }; }

	// Itinerary
	function generateItinerary(tripId, days){
		const trip = getTrips().find(t=>t.id===tripId);
		if(!trip) return { html: '<p>Viaje no encontrado</p>', data: null };
		const dests = getDestinations().filter(d => trip.destinations.includes(d.id));
		const perDay = Math.max(1, Math.ceil(dests.length / days));
		let html = `<h3>${trip.name}</h3><p>${trip.description || ''}</p>`;
		let data = { tripId, days, items: [] };
		for(let d=0; d<days; d++){
			html += `<h4>Día ${d+1}</h4><ul>`;
			for(let i=0;i<perDay;i++){
				const idx = d*perDay + i;
				if(!dests[idx]) break;
				const dest = dests[idx];
				html += `<li><strong>${dest.name}</strong> - ${dest.country}<br>${dest.description||''}</li>`;
				data.items.push({ day: d+1, destId: dest.id });
			}
			html += `</ul>`;
		}
		return { html, data };
	}
	function saveItinerary(it){ const arr = read(ls.itKey); arr.push({ id: uid('it_'), created: new Date().toISOString(), it }); write(ls.itKey, arr); }

	// Helpers
	function haversine(lat1, lon1, lat2, lon2){
		if([lat1,lon1,lat2,lon2].some(v=>v==null)) return null;
		const R = 6371; // km
		const toRad = v => v * Math.PI/180;
		const dLat = toRad(lat2-lat1);
		const dLon = toRad(lon2-lon1);
		const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
		const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return R * c;
	}
	function calculateRoute(originId, destId){
		const dests = getDestinations();
		const o = dests.find(x=>x.id===originId);
		const d = dests.find(x=>x.id===destId);
		if(!o || !d) return 'Origen o destino no encontrado.';
		let dist = haversine(o.lat, o.lng, d.lat, d.lng);
		if(dist==null){
			// distancia estimada por caracteres del nombre (simulación)
			dist = Math.abs(o.name.length - d.name.length) * 50 + 100;
			return `Distancia estimada: ${Math.round(dist)} km. Tiempo aproximado: ${Math.ceil(dist/60)} h (simulado).`;
		}
		const timeHours = dist / 60; // asumiendo 60 km/h media
		return `Distancia: ${dist.toFixed(1)} km. Tiempo estimado: ${timeHours.toFixed(1)} h.`;
	}

	function getSimulatedWeather(destId){
		const d = getDestinations().find(x=>x.id===destId) || { name: 'Desconocido' };
		const temps = [18,20,22,24,26,28,15,10];
		const conditions = ['Soleado','Nublado','Lluvioso','Tormenta','Parcialmente nublado'];
		const data = {
			destId,
			destName: d.name,
			temp: temps[Math.floor(Math.random()*temps.length)],
			condition: conditions[Math.floor(Math.random()*conditions.length)]
		};
		return data;
	}

	// Renderers y populators
	function renderDestinations(filter=''){
		const list = document.getElementById('destList');
		if(!list) return;
		const all = getDestinations().filter(d => (d.name||'').toLowerCase().includes(filter.toLowerCase()) || (d.country||'').toLowerCase().includes(filter.toLowerCase()));
		list.innerHTML = '';
		all.forEach(d=>{
			const li = document.createElement('li');
			li.innerHTML = `<div>
				<strong>${d.name}</strong> <small>${d.country||''}</small><br>
				<small>${d.description||''}</small>
			</div>
			<div>
				<button data-id="${d.id}" class="editDest">Editar</button>
				<button data-id="${d.id}" class="delDest">Eliminar</button>
			</div>`;
			list.appendChild(li);
		});
		// bind events
		list.querySelectorAll('.delDest').forEach(b=>b.addEventListener('click', (e)=>{ deleteDestination(e.target.dataset.id); }));
		list.querySelectorAll('.editDest').forEach(b=>b.addEventListener('click', (e)=>{
			const id = e.target.dataset.id;
			const d = getDestinations().find(x=>x.id===id);
			if(!d) return;
			document.getElementById('destId').value = d.id;
			document.getElementById('destName').value = d.name;
			document.getElementById('destCountry').value = d.country;
			document.getElementById('destDesc').value = d.description;
			document.getElementById('destLat').value = d.lat || '';
			document.getElementById('destLng').value = d.lng || '';
			document.getElementById('destImg').value = d.img || '';
			window.scrollTo(0,0);
		}));
	}

	function renderTrips(filter=''){
		const list = document.getElementById('tripList');
		if(!list) return;
		const all = getTrips().filter(t => (t.name||'').toLowerCase().includes(filter.toLowerCase()));
		list.innerHTML = '';
		all.forEach(t=>{
			const names = (t.destinations||[]).map(id => (getDestinations().find(d=>d.id===id)||{name:'?' }).name).join(', ');
			const li = document.createElement('li');
			li.innerHTML = `<div><strong>${t.name}</strong><br><small>${names}</small></div>
			<div>
				<button data-id="${t.id}" class="editTrip">Editar</button>
				<button data-id="${t.id}" class="delTrip">Eliminar</button>
			</div>`;
			list.appendChild(li);
		});
		list.querySelectorAll('.delTrip').forEach(b=>b.addEventListener('click', (e)=>{ deleteTrip(e.target.dataset.id); }));
		list.querySelectorAll('.editTrip').forEach(b=>b.addEventListener('click', (e)=>{
			const id = e.target.dataset.id;
			const t = getTrips().find(x=>x.id===id);
			if(!t) return;
			document.getElementById('tripId').value = t.id;
			document.getElementById('tripName').value = t.name;
			document.getElementById('tripDesc').value = t.description;
			const sel = document.getElementById('tripDestinations');
			Array.from(sel.options).forEach(opt => opt.selected = t.destinations.includes(opt.value));
			window.scrollTo(0,0);
		}));
	}

	function populateDestinationSelect(selectId, includePlaceholder=false){
		const el = document.getElementById(selectId);
		if(!el) return;
		el.innerHTML = '';
		if(includePlaceholder) el.appendChild(new Option('-- seleccionar --',''));
		getDestinations().forEach(d => el.appendChild(new Option(`${d.name} (${d.country||''})`, d.id)));
	}

	function populateTripSelect(selectId){
		const el = document.getElementById(selectId);
		if(!el) return;
		el.innerHTML = '';
		getTrips().forEach(t => el.appendChild(new Option(t.name, t.id)));
	}

	function renderWeatherRecords(){
		const ul = document.getElementById('weatherList');
		if(!ul) return;
		const arr = read(ls.weatherKey);
		ul.innerHTML = '';
		arr.forEach(r => {
			const li = document.createElement('li');
			li.innerHTML = `<div><strong>${r.destName}</strong> ${r.temp}°C - ${r.condition}<br><small>${r.date}</small></div>`;
			ul.appendChild(li);
		});
	}

	function renderBudget(tripId){
		const summary = document.getElementById('budgetSummary');
		const list = document.getElementById('expenseList');
		if(!summary || !list) return;
		const b = getBudget(tripId);
		const totalExp = (b.expenses||[]).reduce((s,x)=>s+x.amt,0);
		const state = totalExp <= (b.amount||0) ? 'Dentro del presupuesto' : 'Sobre presupuesto';
		summary.innerText = `Presupuesto: ${b.amount.toFixed(2)} | Gastos: ${totalExp.toFixed(2)} | Estado: ${state}`;
		list.innerHTML = '';
		(b.expenses||[]).forEach(e => {
			const li = document.createElement('li');
			li.innerHTML = `<div>${e.desc} — ${e.amt.toFixed(2)}</div>`;
			list.appendChild(li);
		});
	}

	// API público
	return {
		renderDestinations,
		saveDestination,
		getDestinations,
		renderTrips,
		saveTrip,
		populateDestinationSelect,
		populateTripSelect,
		populateDestinationSelectAll: populateDestinationSelect,
		calculateRoute,
		getSimulatedWeather,
		saveWeather,
		renderWeatherRecords,
		saveBudget,
		addExpense,
		renderBudget,
		generateItinerary,
		saveItinerary,
		populateTripSelect
	};
})();