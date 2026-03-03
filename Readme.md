# Raffle Search

A WordPress Gutenberg block that integrates [Raffle AI](https://raffle.ai) search into any post or page. Features include top questions, autocomplete, AI-generated summaries, and full search results.

## Requirements

-   WordPress 6.1+
-   PHP 7.4+
-   Node.js (for development)

## Installation

1. Upload the `raffle-search` folder to `/wp-content/plugins/`.
2. Activate the plugin in **Plugins > Installed Plugins**.
3. Go to **Settings > Raffle Search** and enter your:
    - **Base URL** (default: `https://api.raffle.ai/v2`)
    - **Search UID** (provided by Raffle AI)

## Usage

Insert the **Raffle Search** block from the Gutenberg block inserter (category: Widgets). The block supports wide and full alignment.

## Development

Install dependencies:

```bash
npm install
```

### Available scripts

| Command           | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `npm run build`   | Compile and bundle assets for production into `build/` |
| `npm start`       | Start the development watcher with hot reloading       |
| `npm run format`  | Auto-format source files                               |
| `npm run lint:js` | Lint JavaScript source files                           |

### Project structure

```
raffle-search/
├── src/                  # Source files
│   ├── index.js          # Block registration (editor entry point)
│   ├── edit.js           # Block editor component
│   ├── view.js           # Frontend entry point
│   ├── block.json        # Block metadata
│   ├── style.css         # Frontend styles
│   ├── editor.css        # Editor-only styles
│   ├── api/              # Raffle AI API helpers
│   └── components/
│       └── RaffleSearch.jsx  # Main search component
├── build/                # Compiled output (committed for distribution)
├── includes/
│   └── admin.php         # Plugin settings page
└── raffle-search.php     # Plugin entry point
```

### Tech stack

-   [@wordpress/scripts](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/) — build tooling (webpack + Babel)
-   [@tanstack/react-query](https://tanstack.com/query) — data fetching & caching
-   [@uidotdev/usehooks](https://usehooks.com) — utility hooks

## License

GPL-3.0-or-later — see [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html).
