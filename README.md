# TabStack

> 收起当前标签或所有标签，随时一键恢复。  
> Save the current tab or all tabs, restore anytime.

---

## 功能特点

相比 OneTab，TabStack 让你自己决定收起的范围：

- **收起当前标签** — 只保存并关闭当前活动的一个标签页
- **收起所有标签** — 将当前窗口全部标签打包保存后关闭
- **恢复上次保存** — 弹窗一键恢复最近一次保存的标签组
- **丢弃当前标签** — 不保存直接关闭
- **搜索与筛选** — 在列表页按关键词搜索，或按"当前/所有"筛选
- **确认弹窗** — 收起所有时可选弹出确认，防止误操作
- **自动清理** — 可设置超过 N 天的记录自动删除
- **深色模式** — 自动跟随系统
- **中文 / English** — 支持双语，可在设置页切换

---

## 安装

### 从 Chrome Web Store 安装

> *(上线后补充链接)*

### 本地开发安装

```bash
git clone https://github.com/your-username/tabstack.git
```

1. 打开 Chrome，进入 `chrome://extensions/`
2. 右上角开启 **开发者模式**
3. 点击 **加载已解压的扩展程序**，选择项目根目录 `tabstack/`

---

## 使用方法

| 操作 | 方式 |
|---|---|
| 收起当前标签 | 点击扩展图标 → 蓝色按钮，或 `⌘⇧1` / `Ctrl+Shift+1` |
| 收起所有标签 | 点击扩展图标 → 第二个按钮，或 `⌘⇧2` / `Ctrl+Shift+2` |
| 查看保存列表 | 弹窗底部 → 列表，或直接打开列表页 |
| 恢复单个标签 | 列表页点击任意标签行 |
| 恢复整组标签 | 列表页点击分组右侧 ↩ 按钮 |
| 切换语言 | 设置页 → 语言 → 中文 / English |

---

## 文件结构

```
tabstack/
├── manifest.json
├── _locales/
│   ├── zh_CN/messages.json    # 中文字符串
│   └── en/messages.json       # English strings
├── shared/
│   ├── storage.js             # 数据读写（getGroups / saveGroups / getSettings …）
│   └── i18n.js                # 国际化（initI18n / t / applyI18n / setLang）
├── background/
│   └── service_worker.js      # 处理快捷键命令和消息
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── pages/
│   ├── list/                  # 标签列表页
│   │   ├── list.html
│   │   ├── list.css
│   │   └── list.js
│   └── settings/              # 设置页
│       ├── settings.html
│       ├── settings.css
│       └── settings.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 数据与隐私

- 所有数据仅存储在本地 `chrome.storage.local`，不上传任何服务器
- 仅申请 `tabs` 和 `storage` 两项权限
  - `tabs`：读取标签页的 URL 和标题
  - `storage`：在本地保存标签列表和设置项

---

## 开发

无构建步骤，纯原生 JS + CSS，修改文件后在 `chrome://extensions/` 点刷新即可。

**自定义快捷键**

前往 `chrome://extensions/shortcuts` 修改默认的 `⌘⇧1` / `⌘⇧2`。

**添加新语言**

1. 在 `_locales/` 下新建语言目录，如 `ja/`
2. 复制 `en/messages.json` 并翻译所有 `message` 字段
3. 在 `shared/i18n.js` 的 `initI18n` 中扩展语言检测逻辑
4. 在 `pages/settings/settings.html` 中添加对应的 `<button class="lang-btn">`

---

## License

MIT
