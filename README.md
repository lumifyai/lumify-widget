# @lumifyai/widget

A self-contained, zero-config AI search widget for any website. Add intelligent search to your site with a single script tag.

[![npm version](https://img.shields.io/npm/v/@lumifyai/widget.svg)](https://www.npmjs.com/package/@lumifyai/widget)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Quick Start

Add this script tag to your website:

```html
<script 
  src="https://www.lumify.ai/api/v1/js/lumify-widget.js"
  data-api-key="YOUR_API_KEY"
  data-app-id="YOUR_APP_ID">
</script>
```

That's it! A search button will appear in the bottom-right corner of your page.

## Installation

### CDN (Recommended)

```html
<script src="https://www.lumify.ai/api/v1/js/lumify-widget.js"></script>
```

### npm

```bash
npm install @lumifyai/widget
```

### unpkg

```html
<script src="https://unpkg.com/@lumifyai/widget"></script>
```

### jsdelivr

```html
<script src="https://cdn.jsdelivr.net/npm/@lumifyai/widget"></script>
```

## Configuration

All configuration is done via `data-*` attributes on the script tag:

### Required

| Attribute | Description |
|-----------|-------------|
| `data-api-key` | Your Lumify API key |
| `data-app-id` | Your application ID |

### Display Options

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-mode` | `"floating"` | `"floating"` \| `"inline"` \| `"trigger"` |
| `data-theme` | `"auto"` | `"light"` \| `"dark"` \| `"auto"` |
| `data-position` | `"bottom-right"` | `"bottom-right"` \| `"bottom-left"` \| `"top-right"` \| `"top-left"` |
| `data-accent-color` | `"#6366f1"` | Any CSS color value |
| `data-z-index` | `9999` | CSS z-index for the widget |

### Button Options

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-button-icon` | `"search"` | `"search"` \| `"chat"` \| `"help"` \| `"none"` |
| `data-button-text` | `""` | Optional text next to the button |

### Text Customization

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-modal-title` | `"Search"` | Title in the modal header |
| `data-placeholder` | `"Ask anything..."` | Input placeholder text |
| `data-empty-text` | `"Ask a question to get started"` | Empty state message |

### Behavior Options

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-keyboard-shortcut` | `"true"` | Enable Cmd/Ctrl+K shortcut |
| `data-show-branding` | `"true"` | Show "Powered by Lumify" footer |

### Mode-Specific Options

| Attribute | Description |
|-----------|-------------|
| `data-trigger-selector` | CSS selector for trigger mode |
| `data-container-selector` | CSS selector for inline mode container |

## Examples

### Floating Button (Default)

```html
<script 
  src="https://www.lumify.ai/api/v1/js/lumify-widget.js"
  data-api-key="YOUR_API_KEY"
  data-app-id="YOUR_APP_ID">
</script>
```

### Dark Theme with Custom Color

```html
<script 
  src="https://www.lumify.ai/api/v1/js/lumify-widget.js"
  data-api-key="YOUR_API_KEY"
  data-app-id="YOUR_APP_ID"
  data-theme="dark"
  data-accent-color="#10b981">
</script>
```

### Documentation Site

```html
<script 
  src="https://www.lumify.ai/api/v1/js/lumify-widget.js"
  data-api-key="YOUR_API_KEY"
  data-app-id="YOUR_APP_ID"
  data-modal-title="Search Docs"
  data-placeholder="Search documentation..."
  data-empty-text="Type a question to search the docs">
</script>
```

### Trigger Mode (Attach to Existing Button)

```html
<button id="my-search-btn">Search</button>

<script 
  src="https://www.lumify.ai/api/v1/js/lumify-widget.js"
  data-api-key="YOUR_API_KEY"
  data-app-id="YOUR_APP_ID"
  data-mode="trigger"
  data-trigger-selector="#my-search-btn">
</script>
```

### Inline Mode

```html
<div id="search-container"></div>

<script 
  src="https://www.lumify.ai/api/v1/js/lumify-widget.js"
  data-api-key="YOUR_API_KEY"
  data-app-id="YOUR_APP_ID"
  data-mode="inline"
  data-container-selector="#search-container">
</script>
```

## Live Examples

Visit [lumify.ai/api/v1/examples](https://www.lumify.ai/api/v1/examples/) to see interactive demos.

## Platform Guides

- Webflow Integration Guide [docs.lumify.ai/webflow-guide](https://docs.lumify.ai/webflow-guide)

## API Reference

For programmatic control, the widget exposes a global `LumifyWidget` object:

```javascript
// Open the search modal
LumifyWidget.open();

// Close the search modal
LumifyWidget.close();

// Toggle the search modal
LumifyWidget.toggle();

// Perform a search
LumifyWidget.search('your query');

// Destroy the widget
LumifyWidget.destroy();
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT © [Lumify](https://www.lumify.ai)

## Support

- 📧 Email: support@lumify.ai
- 🐛 Issues: [GitHub Issues](https://github.com/lumifyai/lumify-widget/issues)
- 📖 Docs: [docs.lumify.ai](https://docs.lumify.ai/)

