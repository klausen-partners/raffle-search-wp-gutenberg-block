import { __ } from '@wordpress/i18n';

/**
 * Returns a normalised type key for a result.
 *
 * - URL ending in .pdf → 'document'
 * - raffle:type metadata present → its value (e.g. 'post', 'page', or CPT singular name)
 * - Direct type property fallback
 * @param {Object} result The search result object.
 * @return {string} Normalised type key.
 */
export function getResultType(result) {
	// PDF files are always 'document'
	if (result.url) {
		const ext = result.url.split('.').pop()?.toLowerCase();
		if (ext === 'pdf') {
			return 'document';
		}
	}

	// Check raffle:type from metadata
	if (Array.isArray(result.metadata)) {
		for (const meta of result.metadata) {
			if (meta.selector === 'type' && Array.isArray(meta.matches)) {
				for (const match of meta.matches) {
					if (
						match.tag === 'meta' &&
						match.attr &&
						match.attr.property === 'raffle:type' &&
						match.attr.content
					) {
						const val = match.attr.content.toLowerCase();
						return val === 'post' ? 'news' : val;
					}
				}
			}
		}
	}

	// Fallback to direct type property
	const direct = (
		result.type ||
		result.result_type ||
		result.TYPE ||
		result.resultType ||
		''
	).toLowerCase();
	if (direct) {
		return direct === 'post' ? 'news' : direct;
	}

	return '';
}

/**
 * Returns the translated display label for a type key.
 *
 * @param {string} type Type key (e.g. 'post', 'page', 'document', 'news', or a CPT slug).
 * @return {string} Translated or capitalised display label.
 */
export function getResultTypeLabel(type) {
	switch (type) {
		case 'page':
			return __('Page', 'raffle-search');
		case 'document':
			return __('Document', 'raffle-search');
		case 'news':
			return __('News', 'raffle-search');
		default:
			// For custom post types: capitalise the first letter.
			return type.charAt(0).toUpperCase() + type.slice(1);
	}
}
