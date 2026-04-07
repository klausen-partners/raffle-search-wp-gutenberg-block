import { __ } from '@wordpress/i18n';

export default function RaffleFiltersCard({
	types,
	selectedType,
	onSelectType,
}) {
	return (
		<div className='raffle-filters-card'>
			<div className='raffle-filters-label'>Type:</div>
			<div
				className={
					'raffle-filters-types' + (selectedType ? ' has-active' : '')
				}
			>
				{types.map((type) => (
					<button
						key={type.value}
						className={
							'raffle-filter-type' +
							(selectedType === type.value ? ' is-active' : '')
						}
						onClick={() => onSelectType(type.value)}
					>
						<span className='raffle-filter-type-label'>
							{type.label}
						</span>
						<span className='raffle-filter-type-count'>
							{type.count}
						</span>
					</button>
				))}
			</div>
			{selectedType && (
				<button
					type='button'
					className='raffle-filters-reset'
					onClick={() => onSelectType(null)}
				>
					{__('Clear', 'raffle-search')}
				</button>
			)}
		</div>
	);
}
