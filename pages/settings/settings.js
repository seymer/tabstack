let currentSettings = {};

const fields = {
  confirmSaveAll:     document.getElementById('confirmSaveAll'),
  showCurrentPreview: document.getElementById('showCurrentPreview'),
  removeOnRestore:    document.getElementById('removeOnRestore'),
  autoClearDays:      document.getElementById('autoClearDays'),
};

function showSaved() {
  const hint = document.getElementById('savedHint');
  hint.classList.remove('hidden');
  clearTimeout(showSaved._t);
  showSaved._t = setTimeout(() => hint.classList.add('hidden'), 1800);
}

function updateLangButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === getLang());
  });
}

async function init() {
  await initI18n();
  applyI18n();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.tagName === 'OPTION') el.textContent = t(el.dataset.i18n);
  });

  updateLangButtons();

  currentSettings = await getSettings();
  fields.confirmSaveAll.checked     = !!currentSettings.confirmSaveAll;
  fields.showCurrentPreview.checked = !!currentSettings.showCurrentPreview;
  fields.removeOnRestore.checked    = !!currentSettings.removeOnRestore;
  fields.autoClearDays.value        = String(currentSettings.autoClearDays || 0);
}

async function persist() {
  currentSettings = {
    confirmSaveAll:     fields.confirmSaveAll.checked,
    showCurrentPreview: fields.showCurrentPreview.checked,
    removeOnRestore:    fields.removeOnRestore.checked,
    autoClearDays:      parseInt(fields.autoClearDays.value, 10),
  };
  await saveSettings(currentSettings);
  showSaved();
}

Object.values(fields).forEach(el => el.addEventListener('change', persist));

document.getElementById('langToggle').addEventListener('click', async (e) => {
  const btn = e.target.closest('.lang-btn');
  if (!btn) return;
  await setLang(btn.dataset.lang);
  applyI18n();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (el.tagName === 'OPTION') el.textContent = t(el.dataset.i18n);
  });
  document.getElementById('savedHint').textContent = t('saved');
  updateLangButtons();
  showSaved();
});

document.getElementById('clearAllData').addEventListener('click', async () => {
  if (!confirm(t('clearDataConfirm'))) return;
  await chrome.storage.local.remove('tabstack_groups');
  showSaved();
});

init();
