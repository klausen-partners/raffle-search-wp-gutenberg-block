# Raffle Search

A WordPress Gutenberg block that integrates [Raffle](https://raffle.ai) search into any post or page. Features include top questions, autocomplete, AI-generated summaries, and full search results. Note that this requires an active subscription with [Raffle](https://raffle.ai) and a published Search Tool.

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

### Gutenberg blocks

Insert the **Raffle Search** or **Raffle Search Widget** blocks from the Gutenberg block inserter (category: Widgets). The search block supports wide and full alignment.

### Shortcodes

You can also embed the blocks via shortcodes — useful in classic editor pages, widgets, or PHP templates.

**Raffle Search** — renders the full search experience:

```
[raffle_search]
[raffle_search uid="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"]
```

| Attribute | Default   | Description                                      |
| --------- | --------- | ------------------------------------------------ |
| `uid`     | _(empty)_ | Override the global Search UID for this instance |

**Raffle Search Widget** — renders a magnifier icon button:

```
[raffle_search_widget]
[raffle_search_widget mode="link" url="https://example.com/search"]
```

| Attribute | Default   | Description                                                      |
| --------- | --------- | ---------------------------------------------------------------- |
| `mode`    | `overlay` | `overlay` opens the search in a modal; `link` navigates to a URL |
| `url`     | _(empty)_ | Target URL when `mode="link"`                                    |

## Settings

The settings page (**Settings > Raffle Search**) is organised into tabs:

### General

| Setting        | Default                    | Description                                  |
| -------------- | -------------------------- | -------------------------------------------- |
| **Base URL**   | `https://api.raffle.ai/v2` | Raffle API base URL                          |
| **Search UID** | _(empty)_                  | The UID of your published Raffle Search Tool |

### Metadata

Controls which `<meta>` tags the plugin outputs in the `<head>` of posts and pages.

| Setting                   | Default | Description                                                                 |
| ------------------------- | ------- | --------------------------------------------------------------------------- |
| **Add article:tag meta**  | Off     | Output `<meta property="article:tag">` tags from post/page taxonomy terms   |
| **Add raffle:type meta**  | Off     | Output `<meta property="raffle:type">` with the post type (page, post, CPT) |
| **Enable tags for pages** | Off     | Register the `post_tag` taxonomy for pages so tags can be assigned to them  |

### Settings

Controls search result display and filtering.

| Setting                     | Default   | Description                                                                                                |
| --------------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| **Show References**         | On        | Show reference links below AI summaries                                                                    |
| **Hide summary button**     | Off       | Remove the "AI Summary" button from the search UI                                                          |
| **Excerpt trim length**     | _(none)_  | Maximum character length for result excerpts (leave empty for full length)                                 |
| **Hide excerpts for types** | `pdf`     | Comma-separated list of type slugs whose excerpts should be hidden                                         |
| **Hide Tags**               | _(empty)_ | Exclude or include specific tags from the tag filter bar and result badges (comma-separated list + mode)   |
| **Filter Types**            | _(empty)_ | Exclude or include specific types from the type filter bar and result badges (comma-separated list + mode) |

### Design

Customise the visual appearance of search results and the widget.

| Setting                  | Default   | Description                                                            |
| ------------------------ | --------- | ---------------------------------------------------------------------- |
| **Default Result Image** | _(empty)_ | Fallback image URL when a result has no thumbnail                      |
| **Result Image Width**   | `250`     | Width in pixels for result thumbnails                                  |
| **Type badge colors**    | _(theme)_ | Background and text colour for the type badge                          |
| **Tag badge colors**     | _(theme)_ | Background and text colour for the tag badge                           |
| **Widget Icon Color**    | `#333`    | Icon colour for the search widget (desktop and mobile, set separately) |

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
├── src/                      # Source files
│   ├── index.js              # Block registration (editor entry point)
│   ├── edit.js               # Block editor component
│   ├── view.js               # Frontend entry point
│   ├── block.json            # Block metadata
│   ├── style.css             # Frontend styles
│   ├── editor.css            # Editor-only styles
│   ├── api/                  # Raffle AI API helpers
│   ├── components/
│   │   ├── RaffleSearch.jsx      # Main search component
│   │   ├── RaffleResultCard.jsx  # Individual result card
│   │   ├── RaffleFiltersCard.jsx # Type & tag filter bar
│   │   ├── Spinner.jsx           # Loading spinner
│   │   └── icons/                # SVG icon components
│   ├── hooks/                # Custom React hooks (e.g. useDebounce)
│   ├── types/                # Result type definitions
│   ├── utils/                # Utility helpers (date, html, getResultType)
│   └── widget/               # Raffle Search Widget block
│       ├── block.json
│       ├── index.js
│       ├── edit.js
│       ├── view.js
│       ├── style.css
│       └── editor.css
├── build/                    # Compiled output (committed for distribution)
├── includes/
│   ├── admin.php             # Plugin settings page
│   ├── advanced-settings.php # Metadata output helpers
│   └── helpers.php           # Shared PHP helpers
├── languages/                # Translation files (.pot, .po, .mo, .json)
└── raffle-search.php         # Plugin entry point
```

### Tech stack

-   [@wordpress/scripts](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/) — build tooling (webpack + Babel)
-   [@tanstack/react-query](https://tanstack.com/query) — data fetching & caching
-   [@uidotdev/usehooks](https://usehooks.com) — utility hooks

## Translations

All user-facing strings in the frontend React component use `@wordpress/i18n`'s `__()` function with the `raffle-search` text domain. WordPress delivers translations to the JS bundle via an inline `wp.i18n.setLocaleData()` call generated from a JSON file in the `languages/` directory.

### Languages directory

```
languages/
├── raffle-search.pot                                          # Translation template (all source strings)
├── raffle-search.po / .mo                                     # English fallback
├── raffle-search-da_DK.po / .mo                               # Danish
└── raffle-search-da_DK-ec8a27340a0ab960d3737433af4bcfae.json  # Danish JS translations
```

Each language requires three files: a `.po` (human-editable), a compiled `.mo`, and a `.json` for the JS bundle.

### Editing an existing translation

1. Open the relevant `.po` file (e.g. `languages/raffle-search-da_DK.po`) in [Poedit](https://poedit.net) or any text editor.
2. Update the `msgstr` values for any strings you want to change.
3. Compile the `.mo` file — in Poedit this happens on save. From the command line:
    ```bash
    msgfmt languages/raffle-search-da_DK.po -o languages/raffle-search-da_DK.mo
    ```
4. Regenerate the `.json` file for the JS bundle (see [JSON format](#json-format) below).

### Adding a new language

1. **Copy the template** to a new `.po` file named after the locale:
    ```bash
    cp languages/raffle-search.pot languages/raffle-search-fr_FR.po
    ```
2. **Edit the `.po` file** — fill in `msgstr` for each `msgid`, and update the header fields (`Language`, `Language-Team`, `PO-Revision-Date`).
3. **Compile the `.mo`** file:
    ```bash
    msgfmt languages/raffle-search-fr_FR.po -o languages/raffle-search-fr_FR.mo
    ```
4. **Create the JS JSON file** (see below).

### JSON format

WordPress delivers JS translations via a JSON file whose name follows a specific pattern:

```
{domain}-{locale}-{md5}.json
```

The `{md5}` hash is computed from the **plugin-relative path** of the script file — specifically the path after stripping the plugin directory, e.g. `build/view.js`:

```bash
echo -n "build/view.js" | md5
# ec8a27340a0ab960d3737433af4bcfae
```

> **Important:** Do not include the full `wp-content/plugins/raffle-search/` prefix — WordPress strips that automatically before computing the hash.

The JSON file must have this structure:

```json
{
	"translation-revision-date": "2026-01-01T00:00:00+00:00",
	"generator": "manual",
	"source": "languages/raffle-search-fr_FR.po",
	"domain": "messages",
	"locale_data": {
		"messages": {
			"": {
				"domain": "messages",
				"lang": "fr_FR",
				"plural-forms": "nplurals=2; plural=(n > 1);"
			},
			"Search…": ["Rechercher…"],
			"Search": ["Rechercher"],
			"Submit search": ["Lancer la recherche"],
			"Suggestions": ["Suggestions"],
			"Popular Questions": ["Questions fréquentes"],
			"AI Summary": ["Résumé IA"],
			"References": ["Références"],
			"No summary available for this query.": [
				"Aucun résumé disponible pour cette recherche."
			],
			"No results found for this query.": [
				"Aucun résultat trouvé pour cette recherche."
			]
		}
	}
}
```

Save it as `languages/raffle-search-fr_FR-ec8a27340a0ab960d3737433af4bcfae.json`.

### Adding new translatable strings

When adding new user-facing strings to `src/components/RaffleSearch.jsx`, wrap them with `__()`:

```js
import { __ } from '@wordpress/i18n';

__('Your new string', 'raffle-search');
```

After adding strings, rebuild the plugin:

```bash
npm run build
```

Then update the `.pot` template and all `.po`/`.json` files with the new strings.

## License

GPL-3.0-or-later — see [https://www.gnu.org/licenses/gpl-3.0.html](https://www.gnu.org/licenses/gpl-3.0.html).
