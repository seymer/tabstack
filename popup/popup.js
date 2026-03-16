let currentTab = null;
let allTabs = [];
let settings = {};
let groups = [];

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return t('timeJustNow');
  if (diff < 3600) return t('timeMinutes', Math.floor(diff / 60));
  if (diff < 86400) return t('timeHours', Math.floor(diff / 3600));
  return t('timeDays', Math.floor(diff / 86400));
}

async function init() {
  await initI18n();
  applyI18n();

  [settings, groups] = await Promise.all([getSettings(), getGroups()]);
  const tabs = await chrome.tabs.query({ currentWindow: true });
  allTabs = tabs;
  currentTab = tabs.find(t2 => t2.active) || tabs[0];

  document.getElementById('tabCount').textContent = t('tabs', tabs.length);
  document.getElementById('saveAllSub').textContent = t('saveAllSub', tabs.length);
  document.getElementById('confirmBody').textContent = t('confirmBody', tabs.length);

  if (settings.showCurrentPreview && currentTab) {
    const preview = document.getElementById('currentPreview');
    preview.classList.remove('hidden');
    document.getElementById('previewTitle').textContent = currentTab.title || 'Untitled';
    document.getElementById('previewDomain').textContent = getDomain(currentTab.url || '');
    const fav = document.getElementById('previewFav');
    if (currentTab.favIconUrl) {
      const img = document.createElement('img');
      img.src = currentTab.favIconUrl;
      img.onerror = () => { fav.textContent = getDomain(currentTab.url || '').charAt(0).toUpperCase(); };
      fav.appendChild(img);
    } else {
      fav.textContent = getDomain(currentTab.url || '').charAt(0).toUpperCase();
      fav.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:500;color:#185fa5';
    }
  }

  const restoreBtn = document.getElementById('btnRestore');
  if (groups.length > 0) {
    const last = groups[0];
    restoreBtn.classList.add('has-data');
    document.getElementById('restoreSub').textContent = t('restoreLastSub', last.tabs.length, timeAgo(last.createdAt));
  } else {
    document.getElementById('restoreSub').textContent = t('noRecords');
  }
}

async function doSaveCurrent() {
  await chrome.runtime.sendMessage({ action: 'saveCurrentTab' });
  window.close();
}

async function doSaveAll() {
  if (settings.confirmSaveAll) {
    document.getElementById('confirmOverlay').classList.remove('hidden');
    return;
  }
  await chrome.runtime.sendMessage({ action: 'saveAllTabs' });
  window.close();
}

async function doRestore() {
  if (groups.length === 0) return;
  const last = groups[0];
  for (const tab of last.tabs) {
    await chrome.tabs.create({ url: tab.url, active: false });
  }
  if (settings.removeOnRestore) {
    await removeGroup(last.id);
  }
  window.close();
}

async function doDiscard() {
  await chrome.runtime.sendMessage({ action: 'discardCurrentTab' });
  window.close();
}

document.getElementById('btnSaveCurrent').addEventListener('click', doSaveCurrent);
document.getElementById('btnSaveAll').addEventListener('click', doSaveAll);
document.getElementById('btnRestore').addEventListener('click', doRestore);
document.getElementById('btnDiscard').addEventListener('click', doDiscard);

document.getElementById('confirmOk').addEventListener('click', async () => {
  if (document.getElementById('dontAskAgain').checked) {
    await saveSettings({ ...settings, confirmSaveAll: false });
  }
  await chrome.runtime.sendMessage({ action: 'saveAllTabs' });
  window.close();
});

document.getElementById('confirmCancel').addEventListener('click', () => {
  document.getElementById('confirmOverlay').classList.add('hidden');
});

document.getElementById('btnList').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('pages/list/list.html') });
  window.close();
});

document.getElementById('btnSettings').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('pages/settings/settings.html') });
  window.close();
});

init();
