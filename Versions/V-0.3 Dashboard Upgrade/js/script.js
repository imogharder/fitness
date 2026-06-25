/* ============================================================
   BodyStats V-0.3 — script.js
   All V-0.2 functions preserved unchanged.
   New sections: Navigation, Dashboard, Analytics, Goals, Achievements
   ============================================================ */

// ─────────────────────────────────────────────────
// CONSTANTS  (preserved)
// ─────────────────────────────────────────────────
const STORAGE_KEY = 'bodyStatsEntries';    // ← unchanged from V-0.2
const GOALS_KEY   = 'bodyStatsGoals';       // new in V-0.3

// ─────────────────────────────────────────────────
// DOM REFERENCES  (all V-0.2 IDs preserved)
// ─────────────────────────────────────────────────
const form           = document.getElementById('entry-form');
const dateInput      = document.getElementById('date');
const clearFormBtn   = document.getElementById('clear-form');
const clearHistoryBtn= document.getElementById('clear-history');
const historyBody    = document.getElementById('history-body');
const emptyMessage   = document.getElementById('empty-message');
const resultsSection = document.getElementById('results-section');
const resultsGrid    = document.getElementById('results-grid');
const progressSection= document.getElementById('progress-section');
const progressGrid   = document.getElementById('progress-grid');

// V-0.3 new refs
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const hamburger      = document.getElementById('hamburger');
const dashStatsBar   = document.getElementById('dashboard-stats-bar');
const dashPhysique   = document.getElementById('dashboard-physique-grid');
const dashOverview   = document.getElementById('dashboard-overview');
const analyticsContent=document.getElementById('analytics-content');
const goalsProgress  = document.getElementById('goals-progress');
const achievementsGrid=document.getElementById('achievements-grid');
const saveGoalsBtn   = document.getElementById('save-goals-btn');
const dashNewEntry   = document.getElementById('dash-new-entry-btn');

// ─────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  dateInput.value = new Date().toISOString().split('T')[0];

  // Existing renders
  renderHistory();
  showProgress(getEntries());

  // New V-0.3 renders
  renderDashboard();
  renderAnalytics();
  renderGoals();
  renderAchievements();

  // Populate goals inputs from saved data
  loadGoalInputs();
});

// ─────────────────────────────────────────────────
// STORAGE HELPERS  (preserved)
// ─────────────────────────────────────────────────
function getEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Goals storage (new V-0.3)
function getGoals() {
  const raw = localStorage.getItem(GOALS_KEY);
  return raw ? JSON.parse(raw) : { weight: null, shoulders: null, chest: null, waist: null };
}

function saveGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

// ─────────────────────────────────────────────────
// CALCULATIONS  (preserved exactly)
// ─────────────────────────────────────────────────
function calculateStats(entry) {
  const heightM = entry.height / 100;
  const stats = {};

  if (entry.height && entry.weight) {
    stats.bmi = entry.weight / (heightM * heightM);
  }

  if (entry.waist && entry.height) {
    stats.waistToHeight = entry.waist / entry.height;
  }

  if (entry.shoulders && entry.waist) {
    stats.shoulderToWaist = entry.shoulders / entry.waist;
  }

  if (entry.chest && entry.waist) {
    stats.chestToWaist = entry.chest / entry.waist;
  }

  return stats;
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal';
  if (bmi < 30)   return 'Overweight';
  return 'Obese';
}

function whtrCategory(ratio) {
  if (ratio < 0.4)  return 'Low';
  if (ratio < 0.5)  return 'Healthy';
  if (ratio < 0.6)  return 'Increased risk';
  return 'High risk';
}

// ─────────────────────────────────────────────────
// NAVIGATION  (new V-0.3)
// ─────────────────────────────────────────────────
function navigateTo(sectionId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target
  const target = document.getElementById(`section-${sectionId}`);
  const navBtn  = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (target) target.classList.add('active');
  if (navBtn)  navBtn.classList.add('active');

  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Nav click handlers
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.section));
});

hamburger.addEventListener('click', openSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
dashNewEntry.addEventListener('click', () => navigateTo('measurements'));

// ─────────────────────────────────────────────────
// FORM HANDLING  (preserved + extended to refresh all sections)
// ─────────────────────────────────────────────────
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const entry = {
    id:        Date.now(),
    date:      formData.get('date'),
    height:    parseFloat(formData.get('height'))    || null,
    weight:    parseFloat(formData.get('weight'))    || null,
    shoulders: parseFloat(formData.get('shoulders')) || null,
    chest:     parseFloat(formData.get('chest'))     || null,
    waist:     parseFloat(formData.get('waist'))     || null,
    hips:      parseFloat(formData.get('hips'))      || null,
    biceps:    parseFloat(formData.get('biceps'))    || null,
    forearms:  parseFloat(formData.get('forearms'))  || null,
    thighs:    parseFloat(formData.get('thighs'))    || null,
    calves:    parseFloat(formData.get('calves'))    || null,
  };

  const entries = getEntries();
  entries.push(entry);
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveEntries(entries);

  // V-0.2 renders (preserved)
  showResults(entry);
  showProgress(entries);
  renderHistory();

  // V-0.3 renders (new)
  renderDashboard();
  renderAnalytics();
  renderAchievements();
  renderGoals();

  form.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
});

clearFormBtn.addEventListener('click', () => {
  form.reset();
  dateInput.value = new Date().toISOString().split('T')[0];
});

clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Delete all entries? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEY);
    // Refresh all sections
    renderHistory();
    renderDashboard();
    renderAnalytics();
    renderAchievements();
    renderGoals();
    resultsSection.hidden = true;
    progressSection.hidden = true;
  }
});

// ─────────────────────────────────────────────────
// V-0.2 RENDERING  (preserved exactly)
// ─────────────────────────────────────────────────
function showProgress(entries) {
  progressGrid.innerHTML = '';
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sorted.length < 2) { progressSection.hidden = true; return; }

  const latest   = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const fields = [
    { key: 'weight',    label: 'Weight',   unit: 'kg' },
    { key: 'chest',     label: 'Chest',    unit: 'cm' },
    { key: 'waist',     label: 'Waist',    unit: 'cm' },
    { key: 'shoulders', label: 'Shoulder', unit: 'cm' },
  ];

  let hasAny = false;
  fields.forEach((field) => {
    const latestVal  = latest[field.key];
    const prevVal    = previous[field.key];
    if (latestVal == null || prevVal == null) return;

    hasAny = true;
    const diff    = latestVal - prevVal;
    const sign    = diff > 0 ? '+' : '';
    const cssClass= diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';

    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
      <span class="label">${field.label}</span>
      <span class="value ${cssClass}">${sign}${diff.toFixed(1)} ${field.unit}</span>
    `;
    progressGrid.appendChild(div);
  });

  progressSection.hidden = !hasAny;
}

function showResults(entry) {
  const stats = calculateStats(entry);
  resultsGrid.innerHTML = '';

  const items = [];
  if (stats.bmi !== undefined)            items.push({ label: 'BMI',            value: stats.bmi.toFixed(1),            note: bmiCategory(stats.bmi) });
  if (stats.waistToHeight !== undefined)  items.push({ label: 'Waist / Height',  value: stats.waistToHeight.toFixed(2),  note: whtrCategory(stats.waistToHeight) });
  if (stats.shoulderToWaist !== undefined)items.push({ label: 'Shoulder / Waist',value: stats.shoulderToWaist.toFixed(2),note: '' });
  if (stats.chestToWaist !== undefined)   items.push({ label: 'Chest / Waist',   value: stats.chestToWaist.toFixed(2),   note: '' });

  if (items.length === 0) { resultsSection.hidden = true; return; }

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

  if (entries.length === 0) { emptyMessage.hidden = false; return; }
  emptyMessage.hidden = true;

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach((entry) => {
    const stats = calculateStats(entry);
    const row   = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(entry.date)}</td>
      <td>${entry.weight ?? '-'}</td>
      <td>${stats.bmi            !== undefined ? stats.bmi.toFixed(1)            : '-'}</td>
      <td>${stats.waistToHeight  !== undefined ? stats.waistToHeight.toFixed(2)  : '-'}</td>
      <td>${stats.shoulderToWaist!== undefined ? stats.shoulderToWaist.toFixed(2): '-'}</td>
      <td>${stats.chestToWaist   !== undefined ? stats.chestToWaist.toFixed(2)   : '-'}</td>
      <td><button class="btn-delete" data-id="${entry.id}">Delete</button></td>
    `;
    historyBody.appendChild(row);
  });

  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const updated = getEntries().filter((e) => e.id !== id);
      saveEntries(updated);
      renderHistory();
      renderDashboard();
      renderAnalytics();
      renderAchievements();
      renderGoals();
    });
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─────────────────────────────────────────────────
// DASHBOARD  (new V-0.3)
// ─────────────────────────────────────────────────
function renderDashboard() {
  const entries = getEntries();
  const sorted  = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest  = sorted[sorted.length - 1] || null;
  const prev    = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
  const stats   = latest ? calculateStats(latest) : {};

  // --- Stats Strip ---
  const totalEntries   = entries.length;
  const daysSinceFirst = sorted.length >= 1
    ? Math.floor((new Date() - new Date(sorted[0].date)) / 86400000)
    : 0;

  dashStatsBar.innerHTML = [
    { label: 'Current Weight',      value: latest?.weight    ? `${latest.weight} kg`                      : '—', sub: '' },
    { label: 'Shoulder / Waist',    value: stats.shoulderToWaist ? stats.shoulderToWaist.toFixed(2)       : '—', sub: 'ratio' },
    { label: 'BMI',                 value: stats.bmi         ? stats.bmi.toFixed(1)                       : '—', sub: stats.bmi ? bmiCategory(stats.bmi) : '' },
    { label: 'Total Entries',       value: totalEntries,      sub: 'logged' },
    { label: 'Days Since Start',    value: daysSinceFirst,    sub: 'days tracking' },
  ].map(s => `
    <div class="stat-pill">
      <div class="stat-pill-label">${s.label}</div>
      <div class="stat-pill-value">${s.value}</div>
      ${s.sub ? `<div class="stat-pill-sub">${s.sub}</div>` : ''}
    </div>
  `).join('');

  // --- Physique Cards ---
  const physiqueFields = [
    { key: 'weight',    label: 'Weight',    unit: 'kg', higherBetter: null },
    { key: 'shoulders', label: 'Shoulders', unit: 'cm', higherBetter: true  },
    { key: 'chest',     label: 'Chest',     unit: 'cm', higherBetter: true  },
    { key: 'waist',     label: 'Waist',     unit: 'cm', higherBetter: false },
    { key: 'biceps',    label: 'Biceps',    unit: 'cm', higherBetter: true  },
  ];

  if (!latest) {
    dashPhysique.innerHTML = noDataHTML('No measurements yet', 'Add your first entry to see your physique overview.');
    dashOverview.innerHTML = noDataHTML('', '');
    return;
  }

  dashPhysique.innerHTML = physiqueFields.map(f => {
    const current = latest[f.key];
    if (current == null) return '';

    const prevVal = prev?.[f.key] ?? null;
    let changeHTML = '';

    if (prevVal != null) {
      const diff = current - prevVal;
      let cls = 'flat', arrow = '→';
      if (diff > 0) { arrow = '↑'; cls = f.higherBetter === false ? 'down' : 'up'; }
      if (diff < 0) { arrow = '↓'; cls = f.higherBetter === false ? 'up'  : 'down'; }
      const sign = diff > 0 ? '+' : '';
      changeHTML = `<div class="physique-card-change ${cls}">${arrow} ${sign}${diff.toFixed(1)} ${f.unit}</div>`;
    }

    return `
      <div class="physique-card">
        <div class="physique-card-label">${f.label}</div>
        <div class="physique-card-value">${current}<span class="physique-card-unit"> ${f.unit}</span></div>
        ${changeHTML}
      </div>
    `;
  }).join('');

  // --- Overview Cards ---
  const score   = calcProgressScore(latest, stats);
  const monthly = calcMonthlyChange(sorted);
  const improve = calcImprovementPct(sorted);

  dashOverview.innerHTML = `
    <div class="overview-card">
      <div class="overview-card-label">Progress Score</div>
      <div class="overview-card-value score-color">${score !== null ? score : '—'}<span style="font-size:1rem;font-weight:400"> /100</span></div>
      <div class="overview-card-desc">Based on BMI, waist/height and shoulder/waist ratios</div>
    </div>
    <div class="overview-card">
      <div class="overview-card-label">Monthly Weight</div>
      <div class="overview-card-value monthly-color">${monthly}</div>
      <div class="overview-card-desc">Weight change compared to 30 days ago</div>
    </div>
    <div class="overview-card">
      <div class="overview-card-label">Physique Improvement</div>
      <div class="overview-card-value improve-color">${improve !== null ? improve + '%' : '—'}</div>
      <div class="overview-card-desc">Ratio improvement from your first entry to today</div>
    </div>
  `;
}

// Progress score out of 100 based on key ratios
function calcProgressScore(entry, stats) {
  if (!entry) return null;
  const scores = [];

  if (stats.bmi !== undefined) {
    const b = stats.bmi;
    let s = b >= 18.5 && b <= 24.9 ? 100
          : b < 18.5 ? Math.max(0, (b - 15) / 3.5 * 70)
          : Math.max(0, 100 - (b - 24.9) / 10.1 * 100);
    scores.push(s);
  }
  if (stats.waistToHeight !== undefined) {
    const r = stats.waistToHeight;
    const s = r <= 0.45 ? 100 : r >= 0.65 ? 0 : (0.65 - r) / 0.20 * 100;
    scores.push(s);
  }
  if (stats.shoulderToWaist !== undefined) {
    const r = stats.shoulderToWaist;
    const s = r >= 1.6 ? 100 : r <= 1.0 ? 0 : (r - 1.0) / 0.6 * 100;
    scores.push(s);
  }

  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Weight change vs 30 days ago
function calcMonthlyChange(sorted) {
  if (sorted.length < 2) return '—';
  const now    = new Date();
  const ago30  = new Date(now - 30 * 86400000);
  const latest = sorted[sorted.length - 1];

  // Find closest entry around 30 days ago
  const older = [...sorted].reverse().find(e => new Date(e.date) <= ago30);
  if (!older || older.weight == null || latest.weight == null) return '—';

  const diff = latest.weight - older.weight;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)} kg`;
}

// Ratio improvement from first to latest entry
function calcImprovementPct(sorted) {
  if (sorted.length < 2) return null;
  const first  = sorted[0];
  const latest = sorted[sorted.length - 1];

  const statsFirst  = calculateStats(first);
  const statsLatest = calculateStats(latest);

  const deltas = [];

  // Higher shoulder/waist is better
  if (statsFirst.shoulderToWaist && statsLatest.shoulderToWaist) {
    deltas.push((statsLatest.shoulderToWaist - statsFirst.shoulderToWaist) / statsFirst.shoulderToWaist * 100);
  }
  // Lower waist/height is better → negate the ratio change
  if (statsFirst.waistToHeight && statsLatest.waistToHeight) {
    deltas.push((statsFirst.waistToHeight - statsLatest.waistToHeight) / statsFirst.waistToHeight * 100);
  }
  // BMI moving toward 22 is better
  if (statsFirst.bmi && statsLatest.bmi) {
    const ideal = 22;
    const distBefore = Math.abs(statsFirst.bmi  - ideal);
    const distAfter  = Math.abs(statsLatest.bmi - ideal);
    if (distBefore > 0) deltas.push((distBefore - distAfter) / distBefore * 100);
  }

  if (deltas.length === 0) return null;
  const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  return (avg >= 0 ? '+' : '') + avg.toFixed(1);
}

// ─────────────────────────────────────────────────
// ANALYTICS  (new V-0.3)
// ─────────────────────────────────────────────────
function renderAnalytics() {
  const entries = getEntries();
  const sorted  = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest  = sorted[sorted.length - 1] || null;

  if (!latest) {
    analyticsContent.innerHTML = noDataHTML('No data yet', 'Log your first measurement to see analytics.');
    return;
  }

  const stats = calculateStats(latest);

  // BMI config
  const bmiDef = {
    label: 'BMI',
    value: stats.bmi,
    formatted: stats.bmi?.toFixed(1),
    category: stats.bmi ? bmiCategory(stats.bmi) : null,
    badgeClass: stats.bmi ? (stats.bmi < 18.5 ? 'badge-warn' : stats.bmi < 25 ? 'badge-good' : stats.bmi < 30 ? 'badge-warn' : 'badge-bad') : 'badge-neutral',
    fillClass: stats.bmi ? (stats.bmi < 25 ? 'fill-success' : 'fill-warn') : 'fill-accent',
    fillPct: stats.bmi ? Math.min(100, (stats.bmi / 40) * 100) : 0,
    desc: 'Body Mass Index. Healthy range: 18.5 – 24.9',
  };

  // WHtR config
  const whtrDef = {
    label: 'Waist / Height Ratio',
    value: stats.waistToHeight,
    formatted: stats.waistToHeight?.toFixed(3),
    category: stats.waistToHeight ? whtrCategory(stats.waistToHeight) : null,
    badgeClass: stats.waistToHeight ? (stats.waistToHeight < 0.5 ? 'badge-good' : stats.waistToHeight < 0.6 ? 'badge-warn' : 'badge-bad') : 'badge-neutral',
    fillClass: stats.waistToHeight ? (stats.waistToHeight < 0.5 ? 'fill-success' : 'fill-warn') : 'fill-accent',
    fillPct: stats.waistToHeight ? Math.min(100, (stats.waistToHeight / 0.7) * 100) : 0,
    desc: 'Keep below 0.50 for optimal health. Lower is better.',
  };

  // Shoulder/Waist config
  const swrDef = {
    label: 'Shoulder / Waist Ratio',
    value: stats.shoulderToWaist,
    formatted: stats.shoulderToWaist?.toFixed(2),
    category: stats.shoulderToWaist ? (stats.shoulderToWaist >= 1.6 ? 'V-Taper' : stats.shoulderToWaist >= 1.4 ? 'Athletic' : 'Building') : null,
    badgeClass: stats.shoulderToWaist ? (stats.shoulderToWaist >= 1.6 ? 'badge-good' : stats.shoulderToWaist >= 1.4 ? 'badge-warn' : 'badge-neutral') : 'badge-neutral',
    fillClass: 'fill-accent',
    fillPct: stats.shoulderToWaist ? Math.min(100, ((stats.shoulderToWaist - 1.0) / 0.8) * 100) : 0,
    desc: 'Aesthetic target: ≥ 1.60. Higher means more V-taper.',
  };

  // Chest/Waist config
  const cwrDef = {
    label: 'Chest / Waist Ratio',
    value: stats.chestToWaist,
    formatted: stats.chestToWaist?.toFixed(2),
    category: stats.chestToWaist ? (stats.chestToWaist >= 1.25 ? 'Excellent' : stats.chestToWaist >= 1.1 ? 'Good' : 'Developing') : null,
    badgeClass: stats.chestToWaist ? (stats.chestToWaist >= 1.25 ? 'badge-good' : 'badge-warn') : 'badge-neutral',
    fillClass: 'fill-accent',
    fillPct: stats.chestToWaist ? Math.min(100, ((stats.chestToWaist - 0.8) / 0.7) * 100) : 0,
    desc: 'Target: ≥ 1.25. Reflects chest-to-waist definition.',
  };

  const cards = [bmiDef, whtrDef, swrDef, cwrDef];

  analyticsContent.innerHTML = `
    <div class="analytics-grid">
      ${cards.map(c => c.value == null ? '' : `
        <div class="analytics-card">
          <div class="analytics-card-header">
            <div>
              <div class="analytics-card-label">${c.label}</div>
              <div class="analytics-card-value">${c.formatted}</div>
            </div>
            <span class="analytics-badge ${c.badgeClass}">${c.category}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill ${c.fillClass}" style="width:${c.fillPct.toFixed(1)}%"></div>
          </div>
          <div class="analytics-card-desc">${c.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─────────────────────────────────────────────────
// GOALS  (new V-0.3)
// ─────────────────────────────────────────────────
const GOAL_FIELDS = [
  { key: 'weight',    label: 'Weight',    unit: 'kg', decrease: false },
  { key: 'shoulders', label: 'Shoulders', unit: 'cm', decrease: false },
  { key: 'chest',     label: 'Chest',     unit: 'cm', decrease: false },
  { key: 'waist',     label: 'Waist',     unit: 'cm', decrease: true  },
];

function loadGoalInputs() {
  const goals = getGoals();
  document.getElementById('goal-weight').value    = goals.weight    ?? '';
  document.getElementById('goal-shoulders').value = goals.shoulders ?? '';
  document.getElementById('goal-chest').value     = goals.chest     ?? '';
  document.getElementById('goal-waist').value     = goals.waist     ?? '';
}

saveGoalsBtn.addEventListener('click', () => {
  const goals = {
    weight:    parseFloat(document.getElementById('goal-weight').value)    || null,
    shoulders: parseFloat(document.getElementById('goal-shoulders').value) || null,
    chest:     parseFloat(document.getElementById('goal-chest').value)     || null,
    waist:     parseFloat(document.getElementById('goal-waist').value)     || null,
  };
  saveGoals(goals);
  renderGoals();
});

function renderGoals() {
  const goals   = getGoals();
  const entries = getEntries();
  const sorted  = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest  = sorted[sorted.length - 1] || null;

  const hasAnyGoal = GOAL_FIELDS.some(f => goals[f.key] != null);
  if (!hasAnyGoal) {
    goalsProgress.innerHTML = `<p style="color:var(--text-muted);font-size:.875rem;padding:.5rem 0">Set your targets above and save to track progress.</p>`;
    return;
  }

  goalsProgress.innerHTML = GOAL_FIELDS.map(f => {
    const goal    = goals[f.key];
    const current = latest?.[f.key] ?? null;
    if (goal == null) return '';

    let pct = 0, pctLabel = 'No data yet';
    if (current != null) {
      if (f.decrease) {
        pct = current <= goal ? 100 : Math.round((goal / current) * 100);
      } else {
        pct = Math.min(100, Math.round((current / goal) * 100));
      }
      pctLabel = `${pct}% complete`;
    }

    const fillClass = pct >= 100 ? 'fill-success' : pct >= 60 ? 'fill-accent' : 'fill-warn';

    return `
      <div class="goal-item">
        <div class="goal-row">
          <span class="goal-label">${f.label}</span>
          <span class="goal-values">
            <strong>${current != null ? current : '—'}</strong>
            <span style="color:var(--text-dim)"> / ${goal} ${f.unit}</span>
          </span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${fillClass}" style="width:${pct}%"></div>
        </div>
        <div class="goal-pct-label">${pctLabel}${pct >= 100 ? ' 🎉' : ''}</div>
      </div>
    `;
  }).join('');
}

// ─────────────────────────────────────────────────
// ACHIEVEMENTS  (new V-0.3)
// ─────────────────────────────────────────────────
const ACHIEVEMENTS = [
  {
    id:    'first_entry',
    icon:  '🏆',
    title: 'First Step',
    desc:  'Logged your very first measurement',
    check: (entries) => entries.length >= 1,
  },
  {
    id:    'five_entries',
    icon:  '💪',
    title: 'Getting Consistent',
    desc:  'Logged 5 measurements',
    check: (entries) => entries.length >= 5,
  },
  {
    id:    'ten_entries',
    icon:  '🔥',
    title: 'Dedicated',
    desc:  'Logged 10 measurements',
    check: (entries) => entries.length >= 10,
  },
  {
    id:    'month_strong',
    icon:  '📅',
    title: 'Month Strong',
    desc:  'Tracking for over 30 days',
    check: (entries) => {
      if (entries.length < 2) return false;
      const sorted = [...entries].sort((a,b) => new Date(a.date)-new Date(b.date));
      return (new Date(sorted[sorted.length-1].date) - new Date(sorted[0].date)) / 86400000 >= 30;
    },
  },
  {
    id:    'vtaper',
    icon:  '⚡',
    title: 'V-Taper',
    desc:  'Shoulder / Waist ratio above 1.60',
    check: (entries) => {
      const latest = getLatest(entries);
      return latest ? (calculateStats(latest).shoulderToWaist ?? 0) >= 1.60 : false;
    },
  },
  {
    id:    'healthy_bmi',
    icon:  '✅',
    title: 'Healthy Range',
    desc:  'BMI in the healthy range (18.5 – 25)',
    check: (entries) => {
      const latest = getLatest(entries);
      if (!latest) return false;
      const bmi = calculateStats(latest).bmi;
      return bmi != null && bmi >= 18.5 && bmi < 25;
    },
  },
  {
    id:    'waist_healthy',
    icon:  '📐',
    title: 'Waist in Check',
    desc:  'Waist / Height ratio below 0.50',
    check: (entries) => {
      const latest = getLatest(entries);
      if (!latest) return false;
      const r = calculateStats(latest).waistToHeight;
      return r != null && r < 0.50;
    },
  },
  {
    id:    'mass_gainer',
    icon:  '📈',
    title: 'Mass Gainer',
    desc:  'Gained 5 kg from your first entry',
    check: (entries) => {
      if (entries.length < 2) return false;
      const s = [...entries].sort((a,b) => new Date(a.date)-new Date(b.date));
      return s[0].weight && s[s.length-1].weight &&
             (s[s.length-1].weight - s[0].weight) >= 5;
    },
  },
];

function getLatest(entries) {
  if (!entries.length) return null;
  return [...entries].sort((a,b) => new Date(b.date)-new Date(a.date))[0];
}

function renderAchievements() {
  const entries = getEntries();

  achievementsGrid.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = a.check(entries);
    return `
      <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
        ${unlocked ? '<div class="achievement-glow"></div>' : ''}
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-title">${a.title}</div>
        <div class="achievement-desc">${a.desc}</div>
        ${unlocked ? '<div class="achievement-tag">Unlocked</div>' : ''}
      </div>
    `;
  }).join('');
}

// ─────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────
function noDataHTML(title, msg) {
  return `
    <div class="no-data">
      <div class="no-data-icon">◉</div>
      ${title ? `<p><strong>${title}</strong></p>` : ''}
      ${msg   ? `<p>${msg}</p>` : ''}
      <button class="btn btn-primary" onclick="navigateTo('measurements')">Add First Entry</button>
    </div>
  `;
}
