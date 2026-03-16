const I18N_KEY = 'tabstack_lang';

let _messages = null;
let _lang = null;

async function loadMessages(lang) {
  const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
  try {
    const res = await fetch(url);
    return await res.json();
  } catch {
    return null;
  }
}

async function initI18n() {
  const result = await chrome.storage.local.get(I18N_KEY);
  const stored = result[I18N_KEY];
  const browserLang = chrome.i18n.getUILanguage().startsWith('zh') ? 'zh_CN' : 'en';
  _lang = stored || browserLang;

  _messages = await loadMessages(_lang);
  if (!_messages) {
    _lang = 'zh_CN';
    _messages = await loadMessages('zh_CN');
  }
}

function t(key, ...subs) {
  if (!_messages) return key;
  const entry = _messages[key];
  if (!entry) return key;
  let msg = entry.message;
  subs.forEach((val, i) => {
    msg = msg.replace(`$${i + 1}`, val);
  });
  return msg;
}

function getLang() { return _lang; }

async function setLang(lang) {
  _lang = lang;
  await chrome.storage.local.set({ [I18N_KEY]: lang });
  _messages = await loadMessages(lang);
}

function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (key) el.placeholder = t(key);
  });
  root.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (key) el.title = t(key);
  });
}
