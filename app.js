const storageKey = 'kalkulator-mebli-wycena-v2';
const oldStorageKey = 'kalkulator-mebli-wycena-v1';

const emptyForm = {
  company: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  client: '',
  clientAddress: '',
  clientEmail: '',
  clientPhone: '',
  nip: '',
  date: '',
  place: '',
  quoteType: '',
  note: '',
};

const emptyRates = {
  carcass: '',
  front: '',
  labor: '',
  shelf: '',
  back: '',
  light: '',
};

const carcassMaterials = [
  'Dąb Riviera K244',
  'Biel Alpejska W1100',
  'Szary Platynowy U122',
  'Orzech Lincoln K076',
  'Czarny Grafit U961',
];

const frontMaterials = [
  'Sosna Słowińska',
  'Dąb Riviera K244',
  'Biel Alpejska W1100',
  'Orzech Lincoln K076',
  'Zielony Szałwia U665',
];

const swatchStyle = {
  'Dąb Riviera K244': 'repeating-linear-gradient(92deg,#b59b6c 0 3px,#c8b58d 3px 6px,#aa8e60 7px 8px)',
  'Biel Alpejska W1100': 'linear-gradient(135deg,#eeeae0,#faf9f4 45%,#e7e4dc)',
  'Szary Platynowy U122': 'linear-gradient(135deg,#aaa9a3,#c5c4bf 50%,#9b9a95)',
  'Orzech Lincoln K076': 'repeating-linear-gradient(95deg,#75543c 0 3px,#997452 3px 5px,#674a36 6px 7px)',
  'Czarny Grafit U961': 'linear-gradient(135deg,#383b3a,#565a58 50%,#292d2c)',
  'Sosna Słowińska': 'repeating-linear-gradient(90deg,#d1c6a9 0 4px,#e0d8c4 4px 8px,#bfb397 9px 10px)',
  'Zielony Szałwia U665': 'linear-gradient(135deg,#929b84,#aeb4a0 48%,#788473)',
};

function emptyCabinet(id) {
  return {
    id,
    name: '',
    carcass: '',
    front: '',
    w: '',
    h: '',
    d: '',
    shelves: '',
    back: false,
    light: false,
  };
}

function loadState() {
  try {
    localStorage.removeItem(oldStorageKey);
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!saved || typeof saved !== 'object') {
      return { form: { ...emptyForm }, rates: { ...emptyRates }, cabinets: [] };
    }

    const cabinets = Array.isArray(saved.cabinets)
      ? saved.cabinets.map((cabinet, index) => ({
          ...emptyCabinet(Number(cabinet.id) || Date.now() + index),
          ...cabinet,
          id: Number(cabinet.id) || Date.now() + index,
          name: cabinet.name ?? '',
          carcass: cabinet.carcass ?? '',
          front: cabinet.front ?? '',
          w: cabinet.w ?? '',
          h: cabinet.h ?? '',
          d: cabinet.d ?? '',
          shelves: cabinet.shelves ?? '',
          back: cabinet.back === true,
          light: cabinet.light === true,
        }))
      : [];

    return {
      form: { ...emptyForm, ...(saved.form || {}) },
      rates: { ...emptyRates, ...(saved.rates || {}) },
      cabinets,
    };
  } catch {
    return { form: { ...emptyForm }, rates: { ...emptyRates }, cabinets: [] };
  }
}

const state = loadState();
const rowsElement = document.querySelector('#cabinet-rows');
let saveTimer;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function readNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function money(value) {
  if (value === null || !Number.isFinite(value)) return '';
  return `${value.toLocaleString('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} zł`;
}

function area(value) {
  return value === null || !Number.isFinite(value) ? '' : value.toFixed(2);
}

function setSaveStatus(text) {
  const status = document.querySelector('#save-state');
  status.innerHTML = `<span class="save-dot"></span>${escapeHtml(text)}`;
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    setSaveStatus(`zapisano ${new Date().toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    })}`);
  } catch {
    setSaveStatus('nie udało się zapisać');
  }
}

function scheduleSave() {
  setSaveStatus('zapisywanie…');
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveState, 350);
}

function optionList(options, selected) {
  return [
    '<option value="">Wybierz…</option>',
    ...options.map((option) => (
      `<option value="${escapeHtml(option)}"${option === selected ? ' selected' : ''}>${escapeHtml(option)}</option>`
    )),
  ].join('');
}

function cabinetRow(cabinet, index) {
  const id = escapeHtml(cabinet.id);
  const rowLabel = cabinet.name || `pozycję ${index + 1}`;
  return `
    <tr data-row-id="${id}">
      <td class="row-name">
        <span class="row-number">${String(index + 1).padStart(2, '0')}</span>
        <input type="text" aria-label="Nazwa elementu ${index + 1}" data-testid="cabinet-name-${index}" data-cabinet-field="name" value="${escapeHtml(cabinet.name)}" />
      </td>
      <td><select aria-label="Płyta korpusu ${index + 1}" data-testid="cabinet-carcass-${index}" class="cell-select" data-cabinet-field="carcass">${optionList(carcassMaterials, cabinet.carcass)}</select></td>
      <td><select aria-label="Dekor frontu ${index + 1}" data-testid="cabinet-front-${index}" class="cell-select" data-cabinet-field="front">${optionList(frontMaterials, cabinet.front)}</select></td>
      <td><input aria-label="Szerokość ${index + 1} w mm" data-testid="cabinet-w-${index}" class="cell-input" type="number" min="0" data-cabinet-field="w" value="${escapeHtml(cabinet.w)}" /></td>
      <td><input aria-label="Wysokość ${index + 1} w mm" data-testid="cabinet-h-${index}" class="cell-input" type="number" min="0" data-cabinet-field="h" value="${escapeHtml(cabinet.h)}" /></td>
      <td><input aria-label="Głębokość ${index + 1} w mm" data-testid="cabinet-d-${index}" class="cell-input" type="number" min="0" data-cabinet-field="d" value="${escapeHtml(cabinet.d)}" /></td>
      <td><input aria-label="Liczba półek ${index + 1}" data-testid="cabinet-shelves-${index}" class="cell-input" type="number" min="0" max="20" data-cabinet-field="shelves" value="${escapeHtml(cabinet.shelves)}" /></td>
      <td class="check-cell"><input aria-label="Plecy ${index + 1}" data-testid="cabinet-back-${index}" type="checkbox" data-cabinet-field="back"${cabinet.back ? ' checked' : ''} /></td>
      <td class="check-cell"><input aria-label="Podświetlenie LED ${index + 1}" data-testid="cabinet-light-${index}" type="checkbox" data-cabinet-field="light"${cabinet.light ? ' checked' : ''} /></td>
      <td class="numeric" data-output="carcassArea"></td>
      <td class="numeric" data-output="frontArea"></td>
      <td class="price-cell" data-output="carcassCost"></td>
      <td class="price-cell" data-output="frontCost"></td>
      <td class="price-cell"><strong data-output="total"></strong></td>
      <td class="price-cell" data-output="options"></td>
      <td class="price-cell" data-output="laborCost"></td>
      <td><button type="button" aria-label="Usuń ${escapeHtml(rowLabel)}" data-testid="remove-cabinet-${index}" data-remove-cabinet="${id}" class="delete-row">Usuń</button></td>
    </tr>
  `;
}

function renderRows() {
  rowsElement.innerHTML = state.cabinets.map(cabinetRow).join('');
  document.querySelector('#row-count').textContent = `Pozycji w zestawieniu: ${state.cabinets.length}`;
  document.querySelector('#meta-count').textContent = `${state.cabinets.length} elementów`;
  updateCalculations();
}

function calculateCabinet(cabinet) {
  const width = readNumber(cabinet.w);
  const height = readNumber(cabinet.h);
  const depth = readNumber(cabinet.d);
  const shelfCount = readNumber(cabinet.shelves);
  const carcassRate = readNumber(state.rates.carcass);
  const frontRate = readNumber(state.rates.front);
  const laborRate = readNumber(state.rates.labor);
  const shelfRate = readNumber(state.rates.shelf);
  const backRate = readNumber(state.rates.back);
  const lightRate = readNumber(state.rates.light);
  const dimensionsReady = width !== null && height !== null && depth !== null;

  const carcassArea = dimensionsReady && shelfCount !== null
    ? (2 * (height / 1000) * (depth / 1000)
      + 2 * (width / 1000) * (depth / 1000)
      + shelfCount * (width / 1000) * (depth / 1000)) * 1.08
    : null;
  const frontArea = width !== null && height !== null
    ? (width / 1000) * (height / 1000)
    : null;
  const carcassCost = cabinet.carcass && carcassArea !== null && shelfCount !== null
      && carcassRate !== null && (shelfCount === 0 || shelfRate !== null)
    ? carcassArea * carcassRate + shelfCount * (shelfRate ?? 0)
    : null;
  const frontCost = cabinet.front && frontArea !== null && frontRate !== null
    ? frontArea * frontRate
    : null;
  const optionsReady = (!cabinet.back || backRate !== null)
    && (!cabinet.light || lightRate !== null);
  const options = optionsReady
    ? (cabinet.back ? backRate ?? 0 : 0) + (cabinet.light ? lightRate ?? 0 : 0)
    : null;
  const laborCost = carcassArea !== null && frontArea !== null && laborRate !== null
    ? (carcassArea + frontArea) * laborRate
    : null;
  const total = carcassCost !== null && frontCost !== null
      && options !== null && laborCost !== null
    ? carcassCost + frontCost + options + laborCost
    : null;

  return { carcassArea, frontArea, carcassCost, frontCost, options, laborCost, total };
}

function sumKnown(values) {
  const knownValues = values.filter((value) => value !== null);
  return knownValues.length
    ? knownValues.reduce((sum, value) => sum + value, 0)
    : null;
}

function updateSwatches() {
  const selectedCarcass = state.cabinets.find((cabinet) => cabinet.carcass)?.carcass;
  const selectedFront = state.cabinets.find((cabinet) => cabinet.front)?.front;
  const swatches = [];

  if (selectedCarcass) swatches.push(['Płyta korpusu', selectedCarcass]);
  if (selectedFront) swatches.push(['Płyta frontu', selectedFront]);

  const content = document.querySelector('#swatch-content');
  if (!swatches.length) {
    content.innerHTML = '<div class="swatch-caption">Nie wybrano materiałów</div>';
    return;
  }

  content.innerHTML = swatches.map(([label, material]) => `
    <div class="swatch-card">
      <span class="swatch-label">${escapeHtml(label)}</span>
      <div class="swatch" style="background:${swatchStyle[material] || '#c8c3b5'}"></div>
      <div class="swatch-name">${escapeHtml(material)}</div>
      <div class="swatch-code">${escapeHtml(material.split(' ').slice(-1)[0])}</div>
    </div>
  `).join('');
}

function updateCalculations() {
  const items = state.cabinets.map(calculateCabinet);
  rowsElement.querySelectorAll('tr').forEach((row, index) => {
    const cabinet = state.cabinets[index];
    const item = items[index];
    row.querySelector('[data-output="carcassArea"]').textContent = area(item.carcassArea);
    row.querySelector('[data-output="frontArea"]').textContent = area(item.frontArea);
    row.querySelector('[data-output="carcassCost"]').textContent = money(item.carcassCost);
    row.querySelector('[data-output="frontCost"]').textContent = money(item.frontCost);
    row.querySelector('[data-output="total"]').textContent = money(item.total);
    row.querySelector('[data-output="options"]').textContent =
      cabinet.back || cabinet.light ? money(item.options) : '';
    row.querySelector('[data-output="laborCost"]').textContent = money(item.laborCost);
  });

  document.querySelector('#total-carcass-area').textContent =
    area(sumKnown(items.map((item) => item.carcassArea)));
  document.querySelector('#total-front-area').textContent =
    area(sumKnown(items.map((item) => item.frontArea)));
  document.querySelector('#total-price').textContent =
    money(sumKnown(items.map((item) => item.total)));
  document.querySelector('#meta-date').textContent = state.form.date
    ? new Date(`${state.form.date}T00:00:00`).toLocaleDateString('pl-PL')
    : '';
  updateSwatches();
}

function exportCsv() {
  const headers = [
    'Nazwa',
    'Płyta korpusu',
    'Dekor frontu',
    'Szerokość mm',
    'Wysokość mm',
    'Głębokość mm',
    'Półki',
    'Plecy',
    'Podświetlenie',
    'Powierzchnia korpusu m2',
    'Powierzchnia frontu m2',
    'Cena razem zł',
  ];
  const rows = state.cabinets.map((cabinet) => {
    const item = calculateCabinet(cabinet);
    return [
      cabinet.name,
      cabinet.carcass,
      cabinet.front,
      cabinet.w,
      cabinet.h,
      cabinet.d,
      cabinet.shelves,
      cabinet.back ? 'Tak' : 'Nie',
      cabinet.light ? 'Tak' : 'Nie',
      area(item.carcassArea),
      area(item.frontArea),
      item.total === null ? '' : item.total.toFixed(2),
    ];
  });
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
    .join('\r\n');
  const file = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'wycena-mebli.csv';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.querySelectorAll('[data-form]').forEach((input) => {
  const updateForm = () => {
    state.form[input.dataset.form] = input.value;
    updateCalculations();
    scheduleSave();
  };
  input.addEventListener('input', updateForm);
  input.addEventListener('change', updateForm);
  input.value = state.form[input.dataset.form] ?? '';
});

document.querySelectorAll('[data-rate]').forEach((input) => {
  const updateRate = () => {
    state.rates[input.dataset.rate] = input.value;
    updateCalculations();
    scheduleSave();
  };
  input.addEventListener('input', updateRate);
  input.addEventListener('change', updateRate);
  input.value = state.rates[input.dataset.rate] ?? '';
});

function updateCabinetFromEvent(event) {
  const input = event.target.closest('[data-cabinet-field]');
  if (!input) return;
  const row = input.closest('tr[data-row-id]');
  const cabinet = state.cabinets.find((item) => String(item.id) === row.dataset.rowId);
  if (!cabinet) return;

  const key = input.dataset.cabinetField;
  cabinet[key] = input.type === 'checkbox' ? input.checked : input.value;
  if (key === 'name') {
    const index = state.cabinets.indexOf(cabinet);
    row.querySelector('[data-remove-cabinet]').setAttribute(
      'aria-label',
      `Usuń ${cabinet.name || `pozycję ${index + 1}`}`,
    );
  }
  updateCalculations();
  scheduleSave();
}

rowsElement.addEventListener('input', updateCabinetFromEvent);
rowsElement.addEventListener('change', updateCabinetFromEvent);
rowsElement.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove-cabinet]');
  if (!button) return;
  const id = button.dataset.removeCabinet;
  state.cabinets = state.cabinets.filter((cabinet) => String(cabinet.id) !== id);
  renderRows();
  scheduleSave();
});

document.querySelector('#add-cabinet').addEventListener('click', () => {
  const nextId = Math.max(Date.now(), ...state.cabinets.map((cabinet) => Number(cabinet.id) || 0)) + 1;
  state.cabinets.push(emptyCabinet(nextId));
  renderRows();
  scheduleSave();
});

document.querySelector('#export-csv').addEventListener('click', exportCsv);
document.querySelector('#print-quote').addEventListener('click', () => window.print());
document.querySelector('#save-now').addEventListener('click', () => {
  window.clearTimeout(saveTimer);
  saveState();
});

document.querySelector('#rates-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const settings = document.querySelector('#rate-settings');
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  settings.hidden = expanded;
  document.querySelector('#rates-chevron').textContent = expanded ? '⌄' : '⌃';
});

renderRows();
setSaveStatus('zapis lokalny');
