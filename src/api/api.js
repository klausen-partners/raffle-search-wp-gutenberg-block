import { buildUrl, getUid } from './routes';

/**
 * Generate a lightweight session ID for this page load.
 * The value is random per page view, which groups searches within the same visit.
 */
const sessionId =
	Math.random().toString( 36 ).substring( 2 ) + Date.now().toString( 36 );

// ---------------------------------------------------------------------------
// Top Questions
// ---------------------------------------------------------------------------

/**
 * Fetch the list of top/popular questions for this Search UI.
 * @param {string} uid - The user or session identifier.
 * @return {Promise<Array<{ question: string }>>} Resolves to an array of question objects.
 */
export async function fetchTopQuestions( uid ) {
	const url = buildUrl( '/top_questions', { uid: getUid( uid ) } );
	const res = await fetch( url );
	if ( ! res.ok ) {
		throw new Error( `Top questions request failed: ${ res.status }` );
	}
	const data = await res.json();
	return data.questions ?? [];
}

// ---------------------------------------------------------------------------
// Autocomplete / Suggestions
// ---------------------------------------------------------------------------

/**
 * Fetch autocomplete suggestions for a partial query.
 * @param {string} query     - The search query string.
 * @param {string} uid       - The user or session identifier.
 * @param {number} [limit=5] - Maximum number of suggestions to return.
 * @return {Promise<Array<{ suggestion: string }>>} Resolves to an array of suggestion objects.
 */
export async function fetchSuggestions( query, uid, limit = 5 ) {
	const url = buildUrl( '/autocomplete', {
		uid: getUid( uid ),
		query,
		limit: String( limit ),
	} );
	const res = await fetch( url );
	if ( ! res.ok ) {
		throw new Error( `Autocomplete request failed: ${ res.status }` );
	}
	const data = await res.json();
	return data.suggestions ?? [];
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

/**
 * Fetch an AI-generated summary for a search query.
 *
 * @param {string} query - The search query string.
 * @param {string} uid   - The user or session identifier.
 * @return {Promise<{ status: string, summary: string, references: Array }>} Resolves to an object containing the summary and references.
 */
export async function fetchSummary( query, uid ) {
	const url = buildUrl( '/summary', {
		uid: getUid( uid ),
		query,
		reference_format: 'html',
	} );
	const res = await fetch( url );
	if ( ! res.ok ) {
		throw new Error( `Summary request failed: ${ res.status }` );
	}
	return res.json();
}

// ---------------------------------------------------------------------------
// Search results
// ---------------------------------------------------------------------------

/**
 * Fetch search results for a query.
 *
 * @param {string} query - The search query string.
 * @param {string} uid   - The user or session identifier.
 * @return {Promise<Array>} Resolves to an array of search result objects.
 */
export async function fetchSearchResults( query, uid ) {
	const url = buildUrl( '/search', {
		uid: getUid( uid ),
		query,
		'session-id': sessionId,
		device: 'desktop',
		// Set preview=true during development to avoid polluting insights.
		// Remove or set to 'false' in production.
		preview: 'false',
	} );
	const res = await fetch( url );
	if ( ! res.ok ) {
		throw new Error( `Search request failed: ${ res.status }` );
	}
	const data = await res.json();
	return data.results ?? [];
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

/**
 * Send click-feedback to Raffle when a user follows a search result link.
 * This improves search quality and enables accurate click-through rate analytics.
 *
 * @param {string} feedbackData - The opaque `feedback_data` string from a search result.
 * @return {Promise<void>}
 */
export async function sendFeedback( feedbackData ) {
	const url = buildUrl( '/feedback' );
	await fetch( url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( { type: 'click', feedback_data: feedbackData } ),
	} );
}
