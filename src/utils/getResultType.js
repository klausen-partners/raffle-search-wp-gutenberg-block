import { __ } from '@wordpress/i18n';

/**
 * Returns a normalised type key for a result: 'news' | 'document' | 'page'.
 *
 * - URL ending in .pdf → 'document'
 * - og:type / metadata / direct prop === 'article' → 'news'
 * - Everything else → 'page'
 * @param {Object} result The search result object.
 * @return {'news'|'document'|'page'} Normalised type key.
 */
export function getResultType( result ) {
	// PDF files are always 'document'
	if ( result.url ) {
		const ext = result.url.split( '.' ).pop()?.toLowerCase();
		if ( ext === 'pdf' ) {
			return 'document';
		}
	}

	// Check og:type from metadata
	if ( Array.isArray( result.metadata ) ) {
		for ( const meta of result.metadata ) {
			if ( meta.selector === 'type' && Array.isArray( meta.matches ) ) {
				for ( const match of meta.matches ) {
					if (
						match.tag === 'meta' &&
						match.attr &&
						( match.attr.property === 'og:type' ||
							match.attr.name === 'og:type' ) &&
						match.attr.content
					) {
						const val = match.attr.content.toLowerCase();
						return val === 'article' ? 'news' : 'page';
					}
				}
				// Fallback: any content in type selector
				if ( meta.matches.length > 0 ) {
					const fallback = (
						meta.matches[ 0 ].attr?.content ||
						meta.matches[ 0 ].value ||
						''
					).toLowerCase();
					if ( fallback ) {
						return fallback === 'article' ? 'news' : 'page';
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
	if ( direct ) {
		return direct === 'article' ? 'news' : 'page';
	}

	return 'page';
}

/**
 * Returns the translated display label for a normalised type key.
 *
 * @param {'news'|'document'|'page'} type Normalised type key.
 * @return {string} Translated display label.
 */
export function getResultTypeLabel( type ) {
	switch ( type ) {
		case 'news':
			return __( 'News', 'raffle-search' );
		case 'document':
			return __( 'Document', 'raffle-search' );
		default:
			return __( 'Page', 'raffle-search' );
	}
}
