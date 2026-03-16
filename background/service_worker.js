importScripts('../shared/storage.js');

async function saveCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  await addGroup([tab], 'current');
  await chrome.tabs.remove(tab.id);
}

async function saveAllTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (tabs.length === 0) return;
  await addGroup(tabs, 'all');
  const ids = tabs.map(t => t.id).filter(Boolean);
  await chrome.tabs.remove(ids);
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save-current') await saveCurrentTab();
  if (command === 'save-all') await saveAllTabs();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.action === 'saveCurrentTab') await saveCurrentTab();
    if (msg.action === 'saveAllTabs') await saveAllTabs();
    if (msg.action === 'discardCurrentTab') {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) await chrome.tabs.remove(tab.id);
    }
    sendResponse({ ok: true });
  })();
  return true;
});

chrome.runtime.onInstalled.addListener(purgeOldGroups);
