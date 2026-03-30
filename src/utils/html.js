// Utility functions for RaffleSearch

/**
 * Trims HTML string to a max character length, preserving tags (simple, not perfect)
 * @param {string} html
 * @param {number} maxLength
 * @return {string} The trimmed HTML string, with tags preserved and ellipsis if trimmed.
 */
export function trimHtml( html, maxLength ) {
	if ( ! maxLength || typeof html !== 'string' || html.length <= maxLength ) {
		return html;
	}
	const text = html.replace( /<[^>]+>/g, '' );
	if ( text.length <= maxLength ) {
		return html;
	}
	let count = 0;
	let i = 0;
	for ( ; i < html.length && count < maxLength; i++ ) {
		if ( html[ i ] === '<' ) {
			while ( i < html.length && html[ i ] !== '>' ) {
				i++;
			}
		} else {
			count++;
		}
	}
	let trimmed = html.slice( 0, i );
	if ( ! trimmed.endsWith( '...' ) ) {
		trimmed += '...';
	}
	return trimmed;
}

/**
 * Filter summary HTML to remove <button> inside <a> if hideSummaryButton is true
 * @param {string}  html
 * @param {boolean} hideSummaryButton
 * @return {string} The filtered HTML string with buttons inside links removed if requested.
 */
export function filterSummaryContent( html, hideSummaryButton ) {
	if ( ! hideSummaryButton ) {
		return html;
	}
	const div = document.createElement( 'div' );
	div.innerHTML = html;
	div.querySelectorAll( 'a > button' ).forEach( ( btn ) => {
		const a = btn.parentNode;
		if ( a && a.tagName === 'A' ) {
			a.remove();
		}
	} );
	div.querySelectorAll( 'p' ).forEach( ( p ) => {
		if (
			p.children.length === 1 &&
			p.children[ 0 ].tagName === 'A' &&
			p.textContent.trim() === p.children[ 0 ].textContent.trim()
		) {
			p.remove();
		}
	} );
	div.querySelectorAll( ':scope > a' ).forEach( ( a ) => a.remove() );
	return div.innerHTML;
}
