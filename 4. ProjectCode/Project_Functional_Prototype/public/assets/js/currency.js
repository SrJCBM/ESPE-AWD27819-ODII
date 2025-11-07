// public/assets/js/currency.js
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('currencyForm');
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const amountInput = document.getElementById('amount');
    const resultSection = document.getElementById('conversionResult');
    const resultValue = document.getElementById('convertedAmount');
    const resultRate = document.getElementById('conversionRate');
    const resultBaseAmount = document.getElementById('conversionBaseAmount');
    const resultUpdated = document.getElementById('conversionUpdatedAt');
    const ratesTableBody = document.getElementById('currencyRates');
    const ratesUpdatedAt = document.getElementById('ratesUpdatedAt');
    const baseCurrencyLabel = document.getElementById('baseCurrencyLabel');

    if (!form || !fromSelect || !toSelect) {
      return;
    }

    let currencyMap = new Map();
    let ratesData = null;

    function createOption(currency) {
      const code = String(currency.code).toUpperCase();
      const name = currency.name || code;
      const symbol = currency.symbol ? String(currency.symbol) : '';
      const option = document.createElement('option');
      option.value = code;
      option.textContent = symbol
        ? `${code} — ${name} (${symbol})`
        : `${code} — ${name}`;
      return option;
    }

    async function loadRates() {
      try {
        const api = globalThis.CurrencyAPI;
        let data;

        if (api && typeof api.listRates === 'function') {
          data = await api.listRates();
        } else {
          const response = await fetch('/api/currency/rates');
          if (!response.ok) {
            throw new Error('No se pudo obtener la lista de tasas');
          }
          data = await response.json();
        }

        if (!data || data.ok === false || !Array.isArray(data.currencies)) {
          throw new Error(data?.msg || 'Respuesta inesperada de la API de monedas');
        }

        ratesData = data;
        currencyMap = new Map();
        fromSelect.innerHTML = '<option value="" disabled selected>Selecciona moneda</option>';
        toSelect.innerHTML = '<option value="" disabled selected>Selecciona moneda</option>';
        ratesTableBody.innerHTML = '';

        data.currencies.forEach((currency) => {
          const normalized = {
            code: String(currency.code).toUpperCase(),
            name: currency.name || currency.code,
            symbol: currency.symbol || '',
            rate: Number(currency.rate),
          };

          currencyMap.set(normalized.code, normalized);
          fromSelect.appendChild(createOption(normalized));
          toSelect.appendChild(createOption(normalized));

          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${normalized.code}</td>
            <td>${normalized.name}</td>
            <td>${normalized.symbol || '-'}</td>
            <td>${normalized.rate.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          `;
          ratesTableBody.appendChild(row);
        });

        if (baseCurrencyLabel) {
          const base = data.base;
          const baseCode = typeof base === 'string' ? base : base?.code;
          const baseName = typeof base === 'string' ? base : base?.name;
          const baseSymbol = typeof base === 'object' ? base?.symbol : undefined;
          let label = baseCode || 'USD';

          if (baseName && baseName !== baseCode) {
            label = `${baseCode} — ${baseName}`;
          }

          if (baseSymbol) {
            label += ` (${baseSymbol})`;
          }

          baseCurrencyLabel.textContent = label;
        }

        if (data.updatedAt) {
          const updated = new Date(data.updatedAt);
          ratesUpdatedAt.textContent = isNaN(updated.getTime())
            ? data.updatedAt
            : updated.toLocaleString('es-EC');
        }

        // Preseleccionar valores comunes
        const defaults = data.defaults || {};
        const preferredFrom = String(defaults.from || '').toUpperCase();
        const preferredTo = String(defaults.to || '').toUpperCase();

        if (preferredFrom && currencyMap.has(preferredFrom)) {
          fromSelect.value = preferredFrom;
        } else {
          const baseCode = typeof data.base === 'string' ? data.base : data.base?.code;
          if (baseCode && currencyMap.has(baseCode)) {
            fromSelect.value = baseCode;
          } else {
            const first = currencyMap.keys().next().value;
            if (first) {
              fromSelect.value = first;
            }
          }
        }

        if (preferredTo && currencyMap.has(preferredTo)) {
          toSelect.value = preferredTo;
        } else {
          const fallback = Array.from(currencyMap.keys()).find((code) => code !== fromSelect.value);
          if (fallback) {
            toSelect.value = fallback;
          }
        }
      } catch (error) {
        console.error('Error cargando tasas', error);
        ratesUpdatedAt.textContent = 'No disponible';
        const message = document.createElement('div');
        message.className = 'alert alert-error';
        message.textContent = error.message || 'Ocurrió un problema al cargar las tasas.';
        form.parentElement?.insertBefore(message, form);
      }
    }

    async function convertCurrency(event) {
      event.preventDefault();

      const from = fromSelect.value;
      const to = toSelect.value;
      const amount = parseFloat(amountInput.value);

      if (!from || !to || Number.isNaN(amount)) {
        alert('Selecciona monedas válidas e ingresa un monto.');
        return;
      }

      try {
        const api = globalThis.CurrencyAPI;
        let data;

        if (api && typeof api.convert === 'function') {
          data = await api.convert({ from, to, amount });
        } else {
          const response = await fetch('/api/currency/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from, to, amount })
          });
          data = await response.json();
          if (!response.ok) {
            throw new Error(data?.msg || 'No se pudo completar la conversión');
          }
        }

        if (!data || data.ok === false) {
          throw new Error(data?.msg || 'No se pudo completar la conversión');
        }

        const conversion = data.conversion;
        const fromCurrency = currencyMap.get(conversion?.from?.code) || conversion?.from;
        const toCurrency = currencyMap.get(conversion?.to?.code) || conversion?.to;

        const toSymbol = toCurrency?.symbol || conversion?.to?.symbol || '';
        const formattedAmount = Number(conversion?.to?.amount || 0).toLocaleString('es-EC', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        resultValue.textContent = `${toSymbol ? `${toSymbol} ` : ''}${formattedAmount} ${conversion?.to?.code || to}`;

        const rate = conversion?.rate || (conversion?.to?.amount / (conversion?.from?.amount || amount));
        const fromLabel = fromCurrency
          ? `${fromCurrency.code}${fromCurrency.symbol ? ` (${fromCurrency.symbol})` : ''}`
          : from;
        const toLabel = toCurrency
          ? `${toCurrency.code}${toCurrency.symbol ? ` (${toCurrency.symbol})` : ''}`
          : to;

        resultRate.textContent = `1 ${fromLabel} = ${rate.toFixed(4)} ${toLabel}`;

        if (resultBaseAmount) {
          const baseInfo = conversion?.base || ratesData?.base || {};
          const baseCode = typeof baseInfo === 'string' ? baseInfo : baseInfo?.code;
          const baseSymbol = typeof baseInfo === 'object' ? (baseInfo?.symbol || '') : '';
          if (conversion?.amountInBase != null && baseCode) {
            const formattedBase = Number(conversion.amountInBase).toLocaleString('es-EC', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
            const label = baseSymbol ? `${baseCode} (${baseSymbol})` : baseCode;
            resultBaseAmount.textContent = `Equivalente en ${label}: ${baseSymbol ? `${baseSymbol} ` : ''}${formattedBase}`;
          } else {
            resultBaseAmount.textContent = '';
          }
        }

        if (conversion?.updatedAt) {
          const updated = new Date(conversion.updatedAt);
          resultUpdated.textContent = isNaN(updated.getTime())
            ? `Actualizado: ${conversion.updatedAt}`
            : `Actualizado: ${updated.toLocaleString('es-EC')}`;
        } else {
          resultUpdated.textContent = '';
        }

        resultSection.hidden = false;
        resultSection.classList.add('highlight');
        setTimeout(() => resultSection.classList.remove('highlight'), 600);
      } catch (error) {
        alert(error.message || 'No se pudo convertir la moneda.');
      }
    }

    form.addEventListener('submit', convertCurrency);
    loadRates();
  });
})();
