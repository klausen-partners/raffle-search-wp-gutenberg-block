/**
 * Frontend entry point for the Raffle Search block.
 *
 * Each block instance on the page is mounted as its own React tree
 * so multiple blocks can coexist without conflict.
 */

import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RaffleSearch from './components/RaffleSearch';
import './style.css';

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
} );

function init() {
	const containers = document.querySelectorAll(
		'.wp-block-raffle-search-search'
	);

	containers.forEach( ( container ) => {
		const searchUid = container.dataset.searchUid || null;
		const root = createRoot( container );
		root.render(
			<QueryClientProvider client={ queryClient }>
				<RaffleSearch searchUid={ searchUid } />
			</QueryClientProvider>
		);
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
