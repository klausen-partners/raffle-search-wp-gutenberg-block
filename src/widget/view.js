/**
 * Frontend entry point for the Raffle Search Widget block.
 *
 * Handles two modes:
 * - "link": navigates to the configured search page URL
 * - "overlay": opens a fullscreen overlay with the Raffle Search experience
 */

import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RaffleSearch from '../components/RaffleSearch';
import './style.css';

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
} );

function OverlaySearch( { onClose } ) {
	return (
		<div
			className="raffle-search-widget-overlay"
			role="dialog"
			aria-modal="true"
			aria-label="Search"
		>
			{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */ }
			<div
				className="raffle-search-widget-overlay__backdrop"
				onClick={ onClose }
			/>
			<div className="raffle-search-widget-overlay__content">
				<button
					className="raffle-search-widget-overlay__close"
					onClick={ onClose }
					aria-label="Close"
					type="button"
				>
					&times;
				</button>
				<QueryClientProvider client={ queryClient }>
					<RaffleSearch searchUid={ null } />
				</QueryClientProvider>
			</div>
		</div>
	);
}

function init() {
	const widgets = document.querySelectorAll( '.raffle-search-widget' );

	widgets.forEach( ( widget ) => {
		const mode = widget.dataset.mode || 'overlay';
		const trigger = widget.querySelector(
			'.raffle-search-widget__trigger'
		);

		if ( ! trigger ) {
			return;
		}

		if ( mode === 'link' ) {
			const url = widget.dataset.searchUrl;
			if ( url ) {
				trigger.addEventListener( 'click', () => {
					window.location.href = url;
				} );
			}
		} else {
			// Overlay mode
			let overlayContainer = null;
			let overlayRoot = null;

			trigger.addEventListener( 'click', () => {
				if ( overlayContainer ) {
					return;
				}

				overlayContainer = document.createElement( 'div' );
				overlayContainer.className =
					'raffle-search-widget-overlay-wrapper';
				document.body.appendChild( overlayContainer );
				document.body.style.overflow = 'hidden';

				overlayRoot = createRoot( overlayContainer );

				const closeOverlay = () => {
					if ( overlayRoot ) {
						overlayRoot.unmount();
						overlayRoot = null;
					}
					if ( overlayContainer ) {
						overlayContainer.remove();
						overlayContainer = null;
					}
					document.body.style.overflow = '';
				};

				overlayRoot.render(
					<OverlaySearch onClose={ closeOverlay } />
				);
			} );
		}
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
