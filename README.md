# GitHub File Collapser

A lightweight Chrome extension that simplifies GitHub PR reviews by auto-collapsing files matching user-defined keywords.

![Demo](demo.gif)

## Features

- **Keyword-based collapsing** - Collapse files containing specific keywords (e.g., "translations", "locale", "i18n")
- **Collapse deleted files** - Optionally hide deleted files from view
- **Collapse empty files** - Optionally hide empty files
- **One-click toggle** - Collapse or expand all matching files instantly
- **Synced settings** - Your preferences sync across devices via Chrome

## Installation

### Chrome Web Store
*(Coming soon)*

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open `chrome://extensions` in Chrome (or Brave/Edge)
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `Translation-Collapser` folder

## Usage

1. Navigate to any GitHub Pull Request files page (`/pull/*/files`)
2. Click the **Collapse Files** button in the PR toolbar
3. All files matching your keywords will collapse
4. Click again to expand them

## Configuration

Right-click the extension icon → **Options** (or click the extension and select Options)

| Setting | Description | Default |
|---------|-------------|---------|
| Keywords | Comma-separated list of keywords to match | `translations` |
| Collapse deleted files | Auto-collapse files marked as deleted | Off |
| Collapse empty files | Auto-collapse files with no changes | Off |

### Example Keywords
```
translations, locale, i18n, .lock, package-lock, yarn.lock
```

## Development

### Project Structure
```
├── manifest.json    # Extension manifest (v3)
├── background.js    # Service worker
├── inject.js        # Content script (injected into GitHub)
├── options.html     # Options page UI
├── options.js       # Options page logic
└── icons/           # Extension icons
```

### Testing Locally

1. Make your changes
2. Go to `chrome://extensions`
3. Click the refresh icon on the extension card
4. Reload the GitHub PR page

### Building for Production

The extension is ready to use as-is. To package for the Chrome Web Store:

1. Remove any development files
2. Zip the extension folder
3. Upload to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)

## Browser Support

- Google Chrome
- Brave Browser
- Microsoft Edge
- Any Chromium-based browser

## Permissions

| Permission | Reason |
|------------|--------|
| `storage` | Save your keyword preferences |
| `github.com` | Inject the collapse button on GitHub PR pages |

## License

MIT
