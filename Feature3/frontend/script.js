const API_BASE = 'http://127.0.0.1:8000';
let files = [];
let selectedPath = null;
let currentView = localStorage.getItem('heatmap_view_mode') || 'grid';

const scanBtn = document.getElementById('scanBtn');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const gridView = document.getElementById('gridView');
const listView = document.getElementById('listView');
const insightsView = document.getElementById('insightsView');
const listBody = document.getElementById('listBody');
const emptyState = document.getElementById('emptyState');
const insightsStats = document.getElementById('insightsStats');
const memoryBreakdown = document.getElementById('memoryBreakdown');
const topHotFiles = document.getElementById('topHotFiles');
const recommendationStats = document.getElementById('recommendationStats');
const summaryChips = document.getElementById('summaryChips');
const statusText = document.getElementById('statusText');
const resultCount = document.getElementById('resultCount');
const lastScanned = document.getElementById('lastScanned');
const detailsContent = document.getElementById('detailsContent');
const copyPathBtn = document.getElementById('copyPathBtn');
const themeToggle = document.getElementById('themeToggle');

function colorFor(type) {
  if (type === 'Hot') return getComputedStyle(document.documentElement).getPropertyValue('--hot').trim();
  if (type === 'Warm') return getComputedStyle(document.documentElement).getPropertyValue('--warm').trim();
  return getComputedStyle(document.documentElement).getPropertyValue('--cold').trim();
}

function iconSvg(name) {
  const icons = {
    file: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8z"></path><path d="M14 2v6h6"></path></svg>',
    heat: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z"></path></svg>',
    type: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle></svg>',
    rec: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    size: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M7 10h.01M11 10h.01M15 10h.01"></path></svg>'
  };
  return icons[name] || '';
}

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function recommendationClass(text) {
  const value = (text || '').toLowerCase();
  if (value.includes('compression') || value.includes('archive')) return 'rec-badge alert';
  if (value.includes('ssd') || value.includes('keep')) return 'rec-badge positive';
  return 'rec-badge neutral';
}

function setStatus(text) {
  statusText.textContent = text;
}

function applyTheme(theme) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  const iconSvg = theme === 'dark'
    ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>'
    : '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a7 7 0 1 0 9 9 9 9 0 1 1-9-9"></path></svg>';
  const label = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  themeToggle.innerHTML = `${iconSvg} ${label}`;
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
  localStorage.setItem('heatmap_theme', nextTheme);
  applyTheme(nextTheme);
}

function saveViewMode(mode) {
  currentView = mode;
  localStorage.setItem('heatmap_view_mode', mode);
  renderFiles();
}

function showSkeletons(count = 6) {
  gridView.innerHTML = '';
  for (let index = 0; index < count; index += 1) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    skeleton.innerHTML = `
      <div class="skeleton-line" style="width: 85%;"></div>
      <div class="skeleton-line" style="width: 62%;"></div>
      <div class="skeleton-line" style="width: 90%;"></div>
    `;
    gridView.appendChild(skeleton);
  }
}

function getFilteredSortedFiles() {
  const query = searchInput.value.trim().toLowerCase();
  const filters = Array.from(document.querySelectorAll('.filter:checked')).map(input => input.value);
  const sort = sortSelect.value;

  let visible = files.filter(file =>
    filters.includes(file.memory_type) &&
    (!query || file.name.toLowerCase().includes(query))
  );

  if (sort === 'heat_desc') visible.sort((a, b) => b.heat_score - a.heat_score);
  if (sort === 'heat_asc') visible.sort((a, b) => a.heat_score - b.heat_score);
  if (sort === 'name_asc') visible.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'name_desc') visible.sort((a, b) => b.name.localeCompare(a.name));

  return visible;
}

async function scanFiles() {
  setStatus('Scanning storage...');
  scanBtn.disabled = true;
  try {
    const res = await fetch(`${API_BASE}/scan`, { method: 'POST' });
    if (!res.ok) throw new Error('Scan failed');
    const now = new Date().toLocaleString();
    lastScanned.textContent = `Last scanned: ${now}`;
    localStorage.setItem('heatmap_last_scan', now);
    await loadData();
    setStatus('Scan completed successfully');
  } catch (error) {
    setStatus('Scan failed. Check backend service.');
    console.error(error);
  } finally {
    scanBtn.disabled = false;
  }
}

async function loadSummary() {
  try {
    const res = await fetch(`${API_BASE}/summary`);
    const data = await res.json();
    summaryChips.innerHTML = '';
    ['Hot', 'Warm', 'Cold'].forEach(type => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.style.borderLeft = `5px solid ${colorFor(type)}`;
      chip.innerHTML = `<span>${type}</span><span>${data[type] || 0}</span>`;
      summaryChips.appendChild(chip);
    });
  } catch (error) {
    console.error(error);
  }
}

async function loadData() {
  setStatus('Loading files...');
  showSkeletons();
  try {
    const res = await fetch(`${API_BASE}/analyze`);
    if (!res.ok) throw new Error('Analyze failed');
    files = await res.json();
    renderFiles();
    await loadSummary();
    resultCount.textContent = `${files.length} files`;
    setStatus('Ready');
  } catch (error) {
    setStatus('Unable to load data. Ensure backend is running.');
    console.error(error);
  }
}

function renderGrid(visible) {
  gridView.innerHTML = '';
  visible.forEach(file => {
    const card = document.createElement('div');
    card.className = 'file-card';
    if (selectedPath && file.path === selectedPath) card.classList.add('selected');

    const tone = document.createElement('div');
    tone.className = 'tone';
    tone.style.background = colorFor(file.memory_type);

    const name = document.createElement('div');
    name.className = 'name';
    name.innerHTML = `${iconSvg('file')}<span>${file.name}</span>`;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<span class="meta-item">${iconSvg('type')} ${file.memory_type}</span><span class="meta-item">${iconSvg('heat')} ${Math.round(file.heat_score * 100)}%</span>`;

    const subMeta = document.createElement('div');
    subMeta.className = 'meta-sub';
    subMeta.innerHTML = `<span class="meta-item">${iconSvg('size')} ${formatBytes(file.size)}</span>`;

    const rec = document.createElement('div');
    rec.className = recommendationClass(file.recommendation);
    rec.innerHTML = `${iconSvg('rec')}<span>${file.recommendation || 'No recommendation'}</span>`;

    const heatTrack = document.createElement('div');
    heatTrack.className = 'heat-track';
    const heatFill = document.createElement('div');
    heatFill.className = 'heat-fill';
    heatFill.style.width = `${Math.min(100, Math.round(file.heat_score * 100))}%`;
    heatFill.style.background = `linear-gradient(90deg, ${colorFor(file.memory_type)}, #ff7043)`;
    heatTrack.appendChild(heatFill);

    card.appendChild(tone);
    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(subMeta);
    card.appendChild(heatTrack);
    card.appendChild(rec);

    card.addEventListener('click', () => showDetails(file));
    gridView.appendChild(card);
  });
}

function renderList(visible) {
  listBody.innerHTML = '';
  visible.forEach(file => {
    const row = document.createElement('tr');
    if (selectedPath && file.path === selectedPath) row.classList.add('active');
    row.innerHTML = `
      <td>${file.name}</td>
      <td><span style="color:${colorFor(file.memory_type)};font-weight:600">${file.memory_type}</span></td>
      <td>${Math.round(file.heat_score * 100)}%</td>
      <td>${file.recommendation || 'No recommendation'}</td>
    `;
    row.addEventListener('click', () => showDetails(file));
    listBody.appendChild(row);
  });
}

function renderInsights(allFiles, visibleFiles) {
  const hotCount = allFiles.filter(file => file.memory_type === 'Hot').length;
  const warmCount = allFiles.filter(file => file.memory_type === 'Warm').length;
  const coldCount = allFiles.filter(file => file.memory_type === 'Cold').length;

  const averageHeat = allFiles.length
    ? (allFiles.reduce((sum, file) => sum + (file.heat_score || 0), 0) / allFiles.length)
    : 0;

  const totalSize = allFiles.reduce((sum, file) => sum + (file.size || 0), 0);
  const totalCount = allFiles.length || 1;

  insightsStats.innerHTML = `
    <article class="insight-stat">
      <div class="title">${iconSvg('file')} Total Files</div>
      <div class="value">${allFiles.length}</div>
      <div class="hint">Visible now: ${visibleFiles.length}</div>
    </article>
    <article class="insight-stat">
      <div class="title">${iconSvg('heat')} Average Heat</div>
      <div class="value">${Math.round(averageHeat * 100)}%</div>
      <div class="hint">Based on all scanned files</div>
    </article>
    <article class="insight-stat">
      <div class="title">${iconSvg('size')} Total Size</div>
      <div class="value">${formatBytes(totalSize)}</div>
      <div class="hint">Combined storage footprint</div>
    </article>
    <article class="insight-stat">
      <div class="title">${iconSvg('type')} Hot Ratio</div>
      <div class="value">${Math.round((hotCount / totalCount) * 100)}%</div>
      <div class="hint">Hot: ${hotCount}, Warm: ${warmCount}, Cold: ${coldCount}</div>
    </article>
  `;

  const distributionRows = [
    { name: 'Hot', count: hotCount, color: colorFor('Hot') },
    { name: 'Warm', count: warmCount, color: colorFor('Warm') },
    { name: 'Cold', count: coldCount, color: colorFor('Cold') }
  ].map(item => {
    const percent = Math.round((item.count / totalCount) * 100);
    return `
      <div class="break-row">
        <span>${item.name}</span>
        <span class="break-track"><span class="break-fill" style="width:${percent}%;background:${item.color}"></span></span>
        <span>${percent}%</span>
      </div>
    `;
  }).join('');

  memoryBreakdown.innerHTML = distributionRows || '<div class="empty-state">No distribution data available.</div>';

  const topHot = [...allFiles]
    .sort((a, b) => (b.heat_score || 0) - (a.heat_score || 0))
    .slice(0, 5);

  topHotFiles.innerHTML = topHot.length
    ? `<div class="insight-list">${topHot.map(file => `
        <article class="insight-item" data-path="${file.path || ''}">
          <div class="name">${iconSvg('file')} <span>${file.name}</span></div>
          <div class="meta"><span>${iconSvg('heat')} ${Math.round((file.heat_score || 0) * 100)}%</span><span>${iconSvg('size')} ${formatBytes(file.size)}</span></div>
        </article>
      `).join('')}</div>`
    : '<div class="empty-state">No files to rank yet.</div>';

  const recGroups = {
    optimize: allFiles.filter(file => {
      const text = (file.recommendation || '').toLowerCase();
      return text.includes('compression') || text.includes('archive');
    }).length,
    keepFast: allFiles.filter(file => {
      const text = (file.recommendation || '').toLowerCase();
      return text.includes('ssd') || text.includes('keep');
    }).length,
    neutral: allFiles.filter(file => {
      const text = (file.recommendation || '').toLowerCase();
      return !(text.includes('compression') || text.includes('archive') || text.includes('ssd') || text.includes('keep'));
    }).length
  };

  recommendationStats.innerHTML = `
    <div class="insight-list">
      <article class="insight-item"><div class="name">${iconSvg('rec')} Optimize / Archive</div><div class="meta"><span>${recGroups.optimize} files</span></div></article>
      <article class="insight-item"><div class="name">${iconSvg('rec')} Keep Fast (SSD)</div><div class="meta"><span>${recGroups.keepFast} files</span></div></article>
      <article class="insight-item"><div class="name">${iconSvg('rec')} Neutral Action</div><div class="meta"><span>${recGroups.neutral} files</span></div></article>
    </div>
  `;

  topHotFiles.querySelectorAll('.insight-item').forEach(element => {
    element.addEventListener('click', () => {
      const targetPath = element.getAttribute('data-path');
      const selected = allFiles.find(file => file.path === targetPath);
      if (selected) {
        showDetails(selected);
        setStatus(`Insights: selected ${selected.name}`);
      }
    });
  });
}

function renderFiles() {
  const visible = getFilteredSortedFiles();
  resultCount.textContent = `${visible.length} visible / ${files.length} total`;

  const showInsights = currentView === 'insights';
  const isEmpty = visible.length === 0;

  insightsView.classList.toggle('hidden', !showInsights);

  if (currentView === 'grid') {
    gridView.style.display = 'grid';
    listView.style.display = 'none';
    emptyState.classList.toggle('hidden', !isEmpty);
  } else {
    gridView.style.display = 'none';
    listView.style.display = currentView === 'list' ? 'block' : 'none';
    emptyState.classList.toggle('hidden', !isEmpty || showInsights);
  }

  if (showInsights) {
    renderInsights(files, visible);
  }

  renderGrid(visible);
  renderList(visible);
}

function detailRow(label, value) {
  return `<div class="detail-row"><span class="label">${label}</span><span class="value">${value || '—'}</span></div>`;
}

function showDetails(file) {
  selectedPath = file.path;
  detailsContent.innerHTML = `
    ${detailRow('Name', file.name)}
    ${detailRow('Path', file.path)}
    ${detailRow('Type', file.memory_type)}
    ${detailRow('Heat', (file.heat_score ?? 0).toFixed(3))}
    ${detailRow('Recommendation', file.recommendation)}
    ${file.size !== undefined ? detailRow('Size', formatBytes(file.size)) : ''}
    ${file.open_count !== undefined ? detailRow('Open Count', file.open_count) : ''}
    ${file.created_at ? detailRow('Created At', file.created_at) : ''}
    ${file.last_accessed ? detailRow('Last Accessed', file.last_accessed) : ''}
    ${file.last_modified ? detailRow('Last Modified', file.last_modified) : ''}
  `;
  copyPathBtn.disabled = !file.path;
  renderFiles();
}

function initNav() {
  const navDashboard = document.getElementById('navDashboard');
  const navList = document.getElementById('navList');
  const navInsights = document.getElementById('navInsights');

  function activate(button) {
    [navDashboard, navList, navInsights].forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  }

  navDashboard.addEventListener('click', () => {
    activate(navDashboard);
    saveViewMode('grid');
  });

  navList.addEventListener('click', () => {
    activate(navList);
    saveViewMode('list');
  });

  navInsights.addEventListener('click', () => {
    activate(navInsights);
    saveViewMode('insights');
    setStatus(files.length ? 'Insights view loaded' : 'Insights view: no files available');
  });

  if (currentView === 'list') activate(navList);
  if (currentView === 'insights') activate(navInsights);
}

scanBtn.addEventListener('click', scanFiles);
refreshBtn.addEventListener('click', loadData);
sortSelect.addEventListener('change', renderFiles);
searchInput.addEventListener('input', renderFiles);
document.querySelectorAll('.filter').forEach(el => el.addEventListener('change', renderFiles));

copyPathBtn.addEventListener('click', async () => {
  if (!selectedPath) return;
  try {
    await navigator.clipboard.writeText(selectedPath);
    setStatus('File path copied to clipboard');
  } catch (error) {
    console.error(error);
    setStatus('Unable to copy path');
  }
});

themeToggle.addEventListener('click', toggleTheme);

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    scanFiles();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
    e.preventDefault();
    loadData();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    searchInput.focus();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    toggleTheme();
  }
});

initNav();

const savedTheme = localStorage.getItem('heatmap_theme') || 'light';
applyTheme(savedTheme);

const savedScan = localStorage.getItem('heatmap_last_scan');
if (savedScan) {
  lastScanned.textContent = `Last scanned: ${savedScan}`;
}

loadData();
