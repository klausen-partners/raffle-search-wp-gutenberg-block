import { __ } from '@wordpress/i18n';
import { useBlockProps, BlockControls } from '@wordpress/block-editor';
import { Placeholder } from '@wordpress/components';

/**
 * Block Editor (backend) component.
 * Displays a static placeholder so editors know the block is in place.
 * The actual interactive search UI is rendered on the frontend via view.js.
 */
export default function Edit() {
	const blockProps = useBlockProps( {
		className: 'raffle-search-block',
	} );

	return (
		<div { ...blockProps }>
			<Placeholder
				icon="search"
				label={ __( 'Raffle Search', 'raffle-search' ) }
				instructions={ __(
					'The Raffle AI search experience will be shown here on the frontend. Configure your API credentials under Settings → Raffle Search.',
					'raffle-search'
				) }
			/>
		</div>
	);
}
