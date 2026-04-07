import { __ } from '@wordpress/i18n';

export default function RaffleFiltersCard( {
	types,
	selectedType,
	onSelectType,
	tags = [],
	selectedTag,
	onSelectTag,
	onClear,
} ) {
	const hasActive = selectedType || selectedTag;
	return (
		<div className="raffle-filters-card">
			<div className="raffle-filters-row">
				<div className="raffle-filters-label">
					{ __( 'Type:', 'raffle-search' ) }
				</div>
				<div
					className={
						'raffle-filters' + ( hasActive ? ' has-active' : '' )
					}
				>
					{ types.map( ( type ) => (
						<button
							key={ type.value }
							type="button"
							className={
								'raffle-filter-type' +
								( selectedType === type.value
									? ' is-active'
									: '' )
							}
							onClick={ () => onSelectType( type.value ) }
						>
							<span className="raffle-filter-type-label">
								{ type.label }
							</span>
							<span className="raffle-filter-type-count">
								{ type.count }
							</span>
						</button>
					) ) }
				</div>
			</div>
			{ tags.length > 0 && (
				<div className="raffle-filters-row">
					<div className="raffle-filters-label">
						{ __( 'Tag:', 'raffle-search' ) }
					</div>
					<div
						className={
							'raffle-filters' +
							( hasActive ? ' has-active' : '' )
						}
					>
						{ tags.map( ( tag ) => (
							<button
								key={ tag.value }
								type="button"
								className={
									'raffle-filter-tag' +
									( selectedTag === tag.value
										? ' is-active'
										: '' )
								}
								onClick={ () => onSelectTag( tag.value ) }
							>
								<span className="raffle-filter-tag-label">
									{ tag.label }
								</span>
								<span className="raffle-filter-tag-count">
									{ tag.count }
								</span>
							</button>
						) ) }
					</div>
				</div>
			) }
			{ hasActive && (
				<button
					type="button"
					className="raffle-filters-reset"
					onClick={ onClear }
				>
					{ __( 'Clear', 'raffle-search' ) }
				</button>
			) }
		</div>
	);
}
