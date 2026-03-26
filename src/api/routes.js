/**
 * Build the full API URL for a given endpoint path and query params.
 *
 * @param {string} path   - e.g. '/top_questions'
 * @param {Object} params - key/value pairs to append as query string
 * @return {string} The full API URL as a string.
 */
export function buildUrl( path, params = {} ) {
	const base =
		( window.raffleSettings && window.raffleSettings.baseUrl ) ||
		'https://api.raffle.ai/v2';

	const url = new URL( base.replace( /\/$/, '' ) + path );

	Object.entries( params ).forEach( ( [ key, value ] ) => {
		if ( value !== undefined && value !== null && value !== '' ) {
			url.searchParams.append( key, value );
		}
	} );

	return url.toString();
}

/**
 * Return the search UID, preferring a per-block override over the global setting.
 * @param {string} [override] - Optional override for the UID.
 * @return {string} The resolved UID string.
 */
export function getUid( override ) {
	return (
		override ||
		( window.raffleSettings && window.raffleSettings.searchUid ) ||
		''
	);
}
