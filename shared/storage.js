const STORAGE_KEY = 'tabstack_groups';

async function getGroups() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

async function saveGroups(groups) {
  await chrome.storage.local.set({ [STORAGE_KEY]: groups });
}

async function addGroup(tabs, type) {
  const groups = await getGroups();
  const group = {
    id: Date.now().toString(),
    type,
    createdAt: Date.now(),
    tabs: tabs.map(t => ({
      title: t.title || 'Untitled',
      url: t.url,
      favIconUrl: t.favIconUrl || ''
    }))
  };
  groups.unshift(group);
  await saveGroups(groups);
  return group;
}

async function removeGroup(groupId) {
  const groups = await getGroups();
  await saveGroups(groups.filter(g => g.id !== groupId));
}

async function removeTabFromGroup(groupId, tabIndex) {
  const groups = await getGroups();
  const group = groups.find(g => g.id === groupId);
  if (!group) return;
  group.tabs.splice(tabIndex, 1);
  if (group.tabs.length === 0) {
    await saveGroups(groups.filter(g => g.id !== groupId));
  } else {
    await saveGroups(groups);
  }
}

async function getSettings() {
  const result = await chrome.storage.local.get('tabstack_settings');
  return Object.assign({
    confirmSaveAll: true,
    showCurrentPreview: true,
    removeOnRestore: false,
    autoClearDays: 30
  }, result.tabstack_settings || {});
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ tabstack_settings: settings });
}

async function purgeOldGroups() {
  const settings = await getSettings();
  if (!settings.autoClearDays) return;
  const cutoff = Date.now() - settings.autoClearDays * 86400000;
  const groups = await getGroups();
  const kept = groups.filter(g => g.createdAt >= cutoff);
  if (kept.length !== groups.length) await saveGroups(kept);
}
