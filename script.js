const dom = {
  length: document.getElementById('length'),
  lengthValue: document.getElementById('length-value'),
  uppercase: document.getElementById('uppercase'),
  lowercase: document.getElementById('lowercase'),
  numbers: document.getElementById('numbers'),
  symbols: document.getElementById('symbols'),
  excludeAmbiguous: document.getElementById('exclude-ambiguous'),
  password: document.getElementById('password'),
  note: document.getElementById('note'),
  generate: document.getElementById('generate'),
  copy: document.getElementById('copy'),
  strengthFill: document.getElementById('strength-fill'),
  strengthLabel: document.getElementById('strength-label'),
  entropyText: document.getElementById('entropy-text'),
  verifyInput: document.getElementById('verify-input'),
  verifyBtn: document.getElementById('verify-btn'),
  improveBtn: document.getElementById('improve-btn'),
  verifyStrengthFill: document.getElementById('verify-strength-fill'),
  verifyStrengthText: document.getElementById('verify-strength-text'),
  improvedPassword: document.getElementById('improved-password'),
  copyImproved: document.getElementById('copy-improved'),
  recommendations: document.getElementById('recommendations'),
  historyList: document.getElementById('history'),
  clearHistory: document.getElementById('clear-history'),
  search: document.getElementById('search'),
  exportHistory: document.getElementById('export-history'),
  importHistory: document.getElementById('import-history'),
  importBtn: document.getElementById('import-btn'),
  toast: document.getElementById('toast'),
  totalGenerated: document.getElementById('total-generated'),
  avgEntropy: document.getElementById('avg-entropy'),
  strongRatio: document.getElementById('strong-ratio'),
  liveStatus: document.getElementById('live-status')
};

const STORAGE_KEY = 'securepass_history_v2';
let historyItems = [];

const sets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+[]{}|;:,.<>?~'
};

const ambiguous = /[O0Il1|`'".,:;]/g;

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  setTimeout(() => dom.toast.classList.remove('show'), 2200);
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historyItems));
}

function estimateEntropy(password, poolSize) {
  if (!password || poolSize <= 0) return 0;
  return Math.round(password.length * Math.log2(poolSize));
}

function scorePassword(password) {
  let score = 0;
  const checks = [
    password.length >= 10,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
    password.length >= 16
  ];
  checks.forEach((ok) => { if (ok) score += 1; });
  return Math.min(score, 5);
}

function strengthMeta(score) {
  const map = [
    { label: 'Muy débil', color: '#ef4444' },
    { label: 'Débil', color: '#f97316' },
    { label: 'Aceptable', color: '#f59e0b' },
    { label: 'Buena', color: '#84cc16' },
    { label: 'Excelente', color: '#22c55e' },
    { label: 'Excelente', color: '#22c55e' }
  ];
  return map[score] || map[0];
}

function applyStrength(fillEl, textEl, score) {
  const pct = (score / 5) * 100;
  const meta = strengthMeta(score);
  fillEl.style.width = `${pct}%`;
  fillEl.style.background = meta.color;
  textEl.textContent = meta.label;
}

function createPassword() {
  const enabledSets = [];
  if (dom.uppercase.checked) enabledSets.push(sets.uppercase);
  if (dom.lowercase.checked) enabledSets.push(sets.lowercase);
  if (dom.numbers.checked) enabledSets.push(sets.numbers);
  if (dom.symbols.checked) enabledSets.push(sets.symbols);

  if (!enabledSets.length) {
    showToast('Selecciona al menos un tipo de carácter.');
    return null;
  }

  const length = Number(dom.length.value);
  const pooled = enabledSets.join('');
  const source = dom.excludeAmbiguous.checked ? pooled.replace(ambiguous, '') : pooled;

  if (!source.length) {
    showToast('No quedan caracteres disponibles con los filtros elegidos.');
    return null;
  }

  const chars = [];
  enabledSets.forEach((set) => {
    const filteredSet = dom.excludeAmbiguous.checked ? set.replace(ambiguous, '') : set;
    if (filteredSet.length) {
      chars.push(filteredSet[Math.floor(Math.random() * filteredSet.length)]);
    }
  });

  while (chars.length < length) {
    chars.push(source[Math.floor(Math.random() * source.length)]);
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return {
    value: chars.join(''),
    poolSize: source.length
  };
}

function updateMetrics() {
  const total = historyItems.length;
  const entropyTotal = historyItems.reduce((acc, i) => acc + (i.entropy || 0), 0);
  const strongCount = historyItems.filter((i) => i.score >= 4).length;

  dom.totalGenerated.textContent = String(total);
  dom.avgEntropy.textContent = total ? `${Math.round(entropyTotal / total)} bits` : '0 bits';
  dom.strongRatio.textContent = total ? `${Math.round((strongCount / total) * 100)}%` : '0%';
}

function renderHistory() {
  const term = dom.search.value.trim().toLowerCase();
  dom.historyList.innerHTML = '';

  historyItems
    .filter((item) => {
      if (!term) return true;
      return item.note.toLowerCase().includes(term) || item.password.toLowerCase().includes(term);
    })
    .forEach((item) => {
      const li = document.createElement('li');
      li.className = 'history-item';

      li.innerHTML = `
        <div class="history-item__top">
          <strong>${item.note || 'Sin etiqueta'}</strong>
          <span>${new Date(item.timestamp).toLocaleString()}</span>
        </div>
        <p class="history-item__pass">${item.password}</p>
        <div class="history-item__actions">
          <button type="button" data-action="copy">Copiar</button>
          <button type="button" data-action="reuse">Reusar</button>
          <button type="button" data-action="delete">Eliminar</button>
        </div>
      `;

      li.querySelector('[data-action="copy"]').addEventListener('click', async () => {
        await navigator.clipboard.writeText(item.password);
        showToast('Contraseña copiada.');
      });

      li.querySelector('[data-action="reuse"]').addEventListener('click', () => {
        dom.password.value = item.password;
        dom.note.value = item.note;
        applyStrength(dom.strengthFill, dom.strengthLabel, item.score);
        dom.entropyText.textContent = `Entropía estimada: ${item.entropy} bits`;
        showToast('Contraseña cargada en el generador.');
      });

      li.querySelector('[data-action="delete"]').addEventListener('click', () => {
        historyItems = historyItems.filter((candidate) => candidate.id !== item.id);
        saveHistory();
        renderHistory();
        updateMetrics();
      });

      dom.historyList.appendChild(li);
    });

  dom.liveStatus.classList.toggle('ok', historyItems.length > 0);
}

function addHistoryItem(password, note, entropy, score) {
  historyItems.unshift({
    id: crypto.randomUUID(),
    password,
    note: note || 'Sin etiqueta',
    entropy,
    score,
    timestamp: new Date().toISOString()
  });

  historyItems = historyItems.slice(0, 200);
  saveHistory();
  renderHistory();
  updateMetrics();
}

function analyzePassword(password) {
  const recs = [];
  if (password.length < 12) recs.push('Usa al menos 12 caracteres.');
  if (!/[A-Z]/.test(password)) recs.push('Añade mayúsculas.');
  if (!/[a-z]/.test(password)) recs.push('Añade minúsculas.');
  if (!/\d/.test(password)) recs.push('Incluye números.');
  if (!/[^A-Za-z0-9]/.test(password)) recs.push('Incluye símbolos especiales.');
  if (/(.)\1\1/.test(password)) recs.push('Evita repeticiones como "aaa" o "111".');

  const uniqueChars = new Set(password).size;
  const entropy = estimateEntropy(password, Math.max(uniqueChars, 1));
  const score = scorePassword(password);

  return { recommendations: recs, entropy, score };
}

function generateAndDisplay() {
  const generated = createPassword();
  if (!generated) return;

  const score = scorePassword(generated.value);
  const entropy = estimateEntropy(generated.value, generated.poolSize);

  dom.password.value = generated.value;
  applyStrength(dom.strengthFill, dom.strengthLabel, score);
  dom.entropyText.textContent = `Entropía estimada: ${entropy} bits`;

  addHistoryItem(generated.value, dom.note.value.trim(), entropy, score);
  dom.note.value = '';
  showToast('Nueva contraseña generada y guardada.');
}

function verifyPassword() {
  const raw = dom.verifyInput.value.trim();
  if (!raw) {
    showToast('Escribe una contraseña para analizar.');
    return;
  }

  const result = analyzePassword(raw);
  applyStrength(dom.verifyStrengthFill, dom.verifyStrengthText, result.score);

  dom.recommendations.innerHTML = '';
  if (!result.recommendations.length) {
    dom.recommendations.innerHTML = '<li>Excelente: cumple con recomendaciones principales.</li>';
  } else {
    result.recommendations.forEach((rec) => {
      const li = document.createElement('li');
      li.textContent = rec;
      dom.recommendations.appendChild(li);
    });
  }

  showToast(`Análisis completado (${result.entropy} bits estimados).`);
}

function improvePassword() {
  if (!dom.verifyInput.value.trim()) {
    showToast('Primero ingresa una contraseña para mejorar.');
    return;
  }

  const previousLength = Math.max(dom.verifyInput.value.trim().length + 4, 16);
  dom.length.value = String(Math.min(previousLength, 64));
  dom.lengthValue.textContent = dom.length.value;

  const generated = createPassword();
  if (!generated) return;

  const score = scorePassword(generated.value);
  const entropy = estimateEntropy(generated.value, generated.poolSize);

  dom.improvedPassword.value = generated.value;
  applyStrength(dom.verifyStrengthFill, dom.verifyStrengthText, score);
  addHistoryItem(generated.value, 'Mejorada desde verificador', entropy, score);
  showToast('Contraseña mejorada generada con éxito.');
}

function exportJson() {
  const payload = JSON.stringify(historyItems, null, 2);
  const file = new Blob([payload], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = `securepass-history-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed)) throw new Error('Formato inválido');

      const sanitized = parsed
        .filter((item) => item && typeof item.password === 'string')
        .map((item) => ({
          id: item.id || crypto.randomUUID(),
          password: item.password,
          note: item.note || 'Importado',
          entropy: Number(item.entropy) || 0,
          score: Number(item.score) || scorePassword(item.password),
          timestamp: item.timestamp || new Date().toISOString()
        }));

      historyItems = sanitized.concat(historyItems).slice(0, 200);
      saveHistory();
      renderHistory();
      updateMetrics();
      showToast('Historial importado correctamente.');
    } catch {
      showToast('No se pudo importar el archivo JSON.');
    }
  };
  reader.readAsText(file);
}

function init() {
  try {
    historyItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    historyItems = [];
  }

  dom.lengthValue.textContent = dom.length.value;
  renderHistory();
  updateMetrics();

  dom.length.addEventListener('input', () => {
    dom.lengthValue.textContent = dom.length.value;
  });

  dom.generate.addEventListener('click', generateAndDisplay);
  dom.copy.addEventListener('click', async () => {
    if (!dom.password.value) return;
    await navigator.clipboard.writeText(dom.password.value);
    showToast('Contraseña copiada al portapapeles.');
  });

  dom.verifyBtn.addEventListener('click', verifyPassword);
  dom.improveBtn.addEventListener('click', improvePassword);

  dom.copyImproved.addEventListener('click', async () => {
    if (!dom.improvedPassword.value) return;
    await navigator.clipboard.writeText(dom.improvedPassword.value);
    showToast('Versión mejorada copiada.');
  });

  dom.search.addEventListener('input', renderHistory);
  dom.clearHistory.addEventListener('click', () => {
    historyItems = [];
    saveHistory();
    renderHistory();
    updateMetrics();
    showToast('Historial eliminado.');
  });

  dom.exportHistory.addEventListener('click', exportJson);
  dom.importBtn.addEventListener('click', () => dom.importHistory.click());
  dom.importHistory.addEventListener('change', (event) => {
    const [file] = event.target.files;
    if (file) importJson(file);
    event.target.value = '';
  });
}

init();
