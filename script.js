// ---------- Constants ----------
const STORAGE_KEY = 'bodyStatsEntries';

// ---------- DOM References ----------
const form = document.getElementById('entry-form');
const dateInput = document.getElementById('date');
const clearFormBtn = document.getElementById('clear-form');
const clearHistoryBtn = document.getElementById('clear-history');
const historyBody = document.getElementById('history-body');
const emptyMessage = document.getElementById('empty-message');
const resultsSection = document.getElementById('results-section');
const resultsGrid = document.getElementById('results-grid');

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  // Default date field to today
  dateInput.value = new Date().toISOString().split('T')[0];
  renderHistory();
});

// ---------- Storage Helpers ----------
function getEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ---------- Calculations ----------
function calculateStats(entry) {
  const heightM = entry.height / 100;
  const stats = {};

  // BMI = weight (kg) / height (m)^2
  if (entry.height && entry.weight) {
    stats.bmi = entry.weight / (heightM * heightM);
  }

  // Waist to Height Ratio
  if (entry.waist && entry.height) {
    stats.waistToHeight = entry.waist / entry.height;
  }

  // Shoulder to Waist Ratio
  if (entry.shoulders && entry.waist) {
    stats.shoulderToWaist = entry.shoulders / entry.waist;
  }

  // Chest to Waist Ratio
  if (entry.chest && entry.waist) {
    stats.chestToWaist = entry.chest / entry.waist;
  }

  return stats;
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function whtrCategory(ratio) {
  if (ratio < 0.4) return 'Low';
  if (ratio < 0.5) return 'Healthy';
  if (ratio < 0.6) return 'Increased risk';
  return 'High risk';
}

// ---------- Form Handling ----------
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const entry = {
    id: Date.now(),
    date: formData.get('date'),
    height: parseFloat(formData.get('height')) || null,
    weight: parseFloat(formData.get('weight')) || null,
    shoulders: parseFloat(formData.get('shoulders')) || null,
    chest: parseFloat(formData.get('chest')) || null,
    waist: parseFloat(formData.get('waist')) || null,
    hips: parseFloat(formData.get('hips')) || null,
    biceps: parseFloat(formData.get('biceps')) || null,
    forearms: parseFloat(formData.get('forearms')) || null,
    thighs: parseFloat(formData.get('thighs')) || null,
    calves: parseFloat(formData.get('calves')) || null,
  };

  const entries = getEntries();
  entries.push(entry);
  // Keep sorted by date (oldest first)
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveEntries(entries);

  showResults(entry);
  renderHistory();

  form.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
});

clearFormBtn.addEventListener('click', () => {
  form.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
});

clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all saved entries? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
    resultsSection.hidden = true;
  }
});

// ---------- Rendering ----------
function showResults(entry) {
  const stats = calculateStats(entry);
  resultsGrid.innerHTML = '';

  const items = [];

  if (stats.bmi !== undefined) {
    items.push({
      label: 'BMI',
      value: stats.bmi.toFixed(1),
      note: bmiCategory(stats.bmi),
    });
  }

  if (stats.waistToHeight !== undefined) {
    items.push({
      label: 'Waist / Height',
      value: stats.waistToHeight.toFixed(2),
      note: whtrCategory(stats.waistToHeight),
    });
  }

  if (stats.shoulderToWaist !== undefined) {
    items.push({
      label: 'Shoulder / Waist',
      value: stats.shoulderToWaist.toFixed(2),
      note: '',
    });
  }

  if (stats.chestToWaist !== undefined) {
    items.push({
      label: 'Chest / Waist',
      value: stats.chestToWaist.toFixed(2),
      note: '',
    });
  }

  if (items.length === 0) {
    resultsSection.hidden = true;
    return;
  }

  items.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
      <span class="label">${item.label}</span>
      <span class="value">${item.value}</span>
      ${item.note ? `<span class="note">${item.note}</span>` : ''}
    `;
    resultsGrid.appendChild(div);
  });

  resultsSection.hidden = false;
}

function renderHistory() {
  const entries = getEntries();
  historyBody.innerHTML = '';

  if (entries.length === 0) {
    emptyMessage.hidden = false;
    return;
  }

  emptyMessage.hidden = true;

  // Show most recent first
  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach((entry) => {
    const stats = calculateStats(entry);
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${formatDate(entry.date)}</td>
      <td>${entry.weight ?? '-'}</td>
      <td>${stats.bmi !== undefined ? stats.bmi.toFixed(1) : '-'}</td>
      <td>${stats.waistToHeight !== undefined ? stats.waistToHeight.toFixed(2) : '-'}</td>
      <td>${stats.shoulderToWaist !== undefined ? stats.shoulderToWaist.toFixed(2) : '-'}</td>
      <td>${stats.chestToWaist !== undefined ? stats.chestToWaist.toFixed(2) : '-'}</td>
      <td><button class="btn-delete" data-id="${entry.id}">Delete</button></td>
    `;

    historyBody.appendChild(row);
  });

  // Attach delete handlers
  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const updated = getEntries().filter((e) => e.id !== id);
      saveEntries(updated);
      renderHistory();
    });
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
