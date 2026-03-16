let allGroups = [];
let activeFilter = 'all';
let searchQuery = '';

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString(getLang() === 'en' ? 'en-US' : 'zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return (getLang() === 'en' ? 'Today ' : '今天 ') + time;
  return d.toLocaleDateString(getLang() === 'en' ? 'en-US' : 'zh-CN', { month: 'short', day: 'numeric' }) + ' ' + time;
}

function buildFavicon(tab) {
  const el = document.createElement('div');
  el.className = 'tab-fav';
  if (tab.favIconUrl) {
    const img = document.createElement('img');
    img.src = tab.favIconUrl;
    img.onerror = () => { el.textContent = getDomain(tab.url).charAt(0).toUpperCase(); };
    el.appendChild(img);
  } else {
    el.textContent = getDomain(tab.url).charAt(0).toUpperCase() || '?';
  }
  return el;
}

function renderGroups() {
  const container = document.getElementById('groups');
  const emptyState = document.getElementById('emptyState');
  container.innerHTML = '';

  const filtered = allGroups.filter(g => {
    if (activeFilter === 'current' && g.type !== 'current') return false;
    if (activeFilter === 'all-tabs' && g.type !== 'all') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return g.tabs.some(tb => tb.title.toLowerCase().includes(q) || (tb.url || '').toLowerCase().includes(q));
    }
    return true;
  });

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    if (searchQuery) {
      document.getElementById('emptyTitle').textContent = t('emptySearchTitle');
      document.getElementById('emptySub').textContent = t('emptySearchSub', searchQuery);
    } else if (activeFilter !== 'all') {
      document.getElementById('emptyTitle').textContent = t('emptyFilterTitle');
      document.getElementById('emptySub').textContent = t('emptyFilterSub');
    } else {
      document.getElementById('emptyTitle').textContent = t('emptyTitle');
      document.getElementById('emptySub').textContent = t('emptySub');
    }
    return;
  }

  emptyState.classList.add('hidden');

  filtered.forEach(group => {
    const card = document.createElement('div');
    card.className = 'group-card';

    const header = document.createElement('div');
    header.className = 'group-header';

    const chip = document.createElement('span');
    chip.className = `group-chip ${group.type === 'current' ? 'chip-current' : 'chip-all'}`;
    chip.textContent = t(group.type === 'current' ? 'chipCurrent' : 'chipAll');

    const meta = document.createElement('span');
    meta.className = 'group-meta';
    meta.textContent = t('groupMeta', formatDate(group.createdAt), group.tabs.length);

    const actions = document.createElement('div');
    actions.className = 'group-actions';

    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'icon-btn';
    restoreBtn.title = t('restoreGroup');
    restoreBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5A4.5 4.5 0 1 0 3.4 3.1L2 2v2.5h2.5L3.2 3.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    restoreBtn.addEventListener('click', () => restoreGroup(group.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn danger';
    deleteBtn.title = t('deleteGroup');
    deleteBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M4 3V1.5h4V3M4.5 5.5v3M7.5 5.5v3M2 3l.75 6.5h6.5L10 3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    deleteBtn.addEventListener('click', () => deleteGroup(group.id));

    actions.appendChild(restoreBtn);
    actions.appendChild(deleteBtn);
    header.appendChild(chip);
    header.appendChild(meta);
    header.appendChild(actions);
    card.appendChild(header);

    const tabsToShow = searchQuery
      ? group.tabs.filter(tb => {
          const q = searchQuery.toLowerCase();
          return tb.title.toLowerCase().includes(q) || (tb.url || '').toLowerCase().includes(q);
        })
      : group.tabs;

    tabsToShow.forEach(tab => {
      const row = document.createElement('div');
      row.className = 'tab-row';

      const fav = buildFavicon(tab);
      const title = document.createElement('span');
      title.className = 'tab-title';
      title.textContent = tab.title || 'Untitled';

      const domain = document.createElement('span');
      domain.className = 'tab-domain';
      domain.textContent = getDomain(tab.url || '');

      const del = document.createElement('button');
      del.className = 'tab-del';
      del.title = t('removeTab');
      del.innerHTML = '✕';
      del.addEventListener('click', async (e) => {
        e.stopPropagation();
        const originalIdx = group.tabs.indexOf(tab);
        await removeTabFromGroup(group.id, originalIdx);
        allGroups = await getGroups();
        renderGroups();
      });

      row.addEventListener('click', () => chrome.tabs.create({ url: tab.url, active: true }));
      row.appendChild(fav);
      row.appendChild(title);
      row.appendChild(domain);
      row.appendChild(del);
      card.appendChild(row);
    });

    container.appendChild(card);
  });
}

async function restoreGroup(groupId) {
  const group = allGroups.find(g => g.id === groupId);
  if (!group) return;
  for (const tab of group.tabs) await chrome.tabs.create({ url: tab.url, active: false });
  const settings = await getSettings();
  if (settings.removeOnRestore) {
    await removeGroup(groupId);
    allGroups = await getGroups();
    renderGroups();
  }
}

async function deleteGroup(groupId) {
  await removeGroup(groupId);
  allGroups = await getGroups();
  renderGroups();
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderGroups();
});

document.getElementById('filterGroup').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = btn.dataset.filter;
  renderGroups();
});

async function init() {
  await initI18n();
  applyI18n();
  allGroups = await getGroups();
  renderGroups();
}

init();
