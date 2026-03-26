import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { Placeholder, PanelBody, TextControl } from '@wordpress/components';

/**
 * Block Editor (backend) component.
 * Displays a static placeholder so editors know the block is in place.
 * The actual interactive search UI is rendered on the frontend via view.js.
 * @param {Object}   root0               - The props object.
 * @param {Object}   root0.attributes    - Block attributes.
 * @param {Function} root0.setAttributes - Function to update block attributes.
 */
export default function Edit( { attributes, setAttributes } ) {
	const { searchUid } = attributes;

	const blockProps = useBlockProps( {
		className: 'raffle-search-block',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Raffle Settings', 'raffle-search' ) }
					initialOpen={ true }
				>
					<TextControl
						label={ __( 'Search UID', 'raffle-search' ) }
						help={ __(
							'Override the global Search UID for this block. Leave empty to use the value from Settings → Raffle Search.',
							'raffle-search'
						) }
						value={ searchUid }
						onChange={ ( val ) =>
							setAttributes( { searchUid: val } )
						}
						placeholder={ __(
							'e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
							'raffle-search'
						) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<Placeholder
					icon="search"
					label={ __( 'Raffle Search', 'raffle-search' ) }
					instructions={
						searchUid
							? __( 'Search UID:', 'raffle-search' ) + searchUid
							: __(
									'The Raffle AI search experience will be shown here on the frontend. Configure your API credentials under Settings → Raffle Search.',
									'raffle-search'
							  )
					}
				/>
			</div>
		</>
	);
}
