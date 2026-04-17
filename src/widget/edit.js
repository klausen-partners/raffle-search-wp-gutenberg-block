import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	URLInput,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack,
} from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
	const { mode, searchPageUrl } = attributes;

	const blockProps = useBlockProps( {
		className: 'raffle-search-widget',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Widget Settings', 'raffle-search' ) }
					initialOpen={ true }
				>
					<VStack spacing={ 4 }>
						<SelectControl
							label={ __( 'Action', 'raffle-search' ) }
							value={ mode }
							options={ [
								{
									label: __(
										'Open search overlay',
										'raffle-search'
									),
									value: 'overlay',
								},
								{
									label: __(
										'Link to search page',
										'raffle-search'
									),
									value: 'link',
								},
							] }
							onChange={ ( val ) =>
								setAttributes( { mode: val } )
							}
						/>

						{ mode === 'link' && (
							<div className="raffle-search-widget-url-field">
								<label
									htmlFor="raffle-search-page-url"
									style={ {
										display: 'block',
										marginBottom: '4px',
										fontWeight: 500,
									} }
								>
									{ __( 'Search page URL', 'raffle-search' ) }
								</label>
								<URLInput
									id="raffle-search-page-url"
									value={ searchPageUrl }
									onChange={ ( url ) =>
										setAttributes( { searchPageUrl: url } )
									}
									placeholder={ __(
										'https://…',
										'raffle-search'
									) }
								/>
							</div>
						) }
					</VStack>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<button
					className="raffle-search-widget__trigger"
					aria-label={ __( 'Search', 'raffle-search' ) }
					type="button"
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-label="Search"
					>
						<circle
							cx="11"
							cy="11"
							r="7"
							stroke="#333"
							strokeWidth="2"
							fill="none"
						/>
						<line
							x1="16.5"
							y1="16.5"
							x2="22"
							y2="22"
							stroke="#333"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				</button>
				<span className="raffle-search-widget__label">
					{ mode === 'link'
						? __( 'Links to:', 'raffle-search' ) +
						  ' ' +
						  ( searchPageUrl || '—' )
						: __( 'Opens search overlay', 'raffle-search' ) }
				</span>
			</div>
		</>
	);
}
