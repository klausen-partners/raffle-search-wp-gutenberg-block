// Helper to extract the type from a result object or its metadata
export function getResultType( result ) {
	// Prefer og:type from metadata if present
	if ( Array.isArray( result.metadata ) ) {
		for ( const meta of result.metadata ) {
			if ( meta.selector === 'type' && Array.isArray( meta.matches ) ) {
				for ( const match of meta.matches ) {
					// Check for og:type property
					if (
						match.tag === 'meta' &&
						match.attr &&
						( match.attr.property === 'og:type' ||
							match.attr.name === 'og:type' ) &&
						match.attr.content
					) {
						return match.attr.content.toLowerCase();
					}
				}
				// Fallback: any content in type selector
				if ( meta.matches.length > 0 ) {
					const fallback =
						meta.matches[ 0 ].attr?.content ||
						meta.matches[ 0 ].value;
					if ( fallback ) {
						return fallback.toLowerCase();
					}
				}
			}
		}
	}
	// Fallback to direct type property
	if (
		result.type ||
		result.result_type ||
		result.TYPE ||
		result.resultType
	) {
		return (
			result.type ||
			result.result_type ||
			result.TYPE ||
			result.resultType ||
			''
		).toLowerCase();
	}
	return '';
}
