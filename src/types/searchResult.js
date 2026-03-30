// @typedef {Object} SearchResult
// @property {string} url
// @property {string} title
// @property {string} content
// @property {string} [description]
// @property {string} [feedback_data]
// @property {Array} [metadata]
// @property {string} [type]
// @property {string} [preview_url]
// @property {string} [configuration]

/**
 * @typedef {Object} MetaMatch
 * @property {string}      tag             - The HTML tag name matched (e.g., 'meta').
 * @property {Object}      attr            - Attributes of the matched tag.
 * @property {string}      [value]         - Value of the matched tag, if any.
 * @property {string}      [property]      - Property attribute of the tag, if present.
 *
 * @typedef {Object} MetaItem
 * @property {string}      selector        - CSS selector for the meta item.
 * @property {MetaMatch[]} matches         - Array of meta tag matches for this selector.
 *
 * @typedef {Object} SearchResult
 * @property {string}      url             - The URL of the search result.
 * @property {string}      title           - The title of the search result.
 * @property {string}      content         - The main content or excerpt of the result.
 * @property {string}      [description]   - Optional description of the result.
 * @property {string}      [feedback_data] - Optional feedback data for analytics.
 * @property {MetaItem[]}  [metadata]      - Optional metadata items for the result.
 * @property {string}      [type]          - Optional type/category of the result.
 * @property {string}      [preview_url]   - Optional preview image or file URL.
 * @property {string}      [configuration] - Optional configuration or settings info.
 */
