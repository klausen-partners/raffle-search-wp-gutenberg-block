// Helper to format ISO date to 'DD-MM-YYYY'
export function formatDate( isoString ) {
	if ( ! isoString ) {
		return '';
	}
	const d = new Date( isoString );
	if ( isNaN( d.getTime() ) ) {
		return isoString;
	}
	const day = String( d.getDate() ).padStart( 2, '0' );
	const month = String( d.getMonth() + 1 ).padStart( 2, '0' );
	const year = d.getFullYear();
	return `${ day }-${ month }-${ year }`;
}
