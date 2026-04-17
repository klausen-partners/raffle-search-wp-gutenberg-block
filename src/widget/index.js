import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import metadata from './block.json';
import './editor.css';

const MagnifierIcon = () => (
	<svg
		width='18'
		height='18'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		aria-label='Search'
	>
		<circle
			cx='11'
			cy='11'
			r='7'
			stroke='currentColor'
			strokeWidth='2'
			fill='none'
		/>
		<line
			x1='16.5'
			y1='16.5'
			x2='22'
			y2='22'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
		/>
	</svg>
);

registerBlockType(metadata.name, {
	icon: MagnifierIcon,
	edit: Edit,
	save: ({ attributes }) => {
		const { mode, searchPageUrl } = attributes;

		return (
			<div
				className='raffle-search-widget'
				data-mode={mode}
				data-search-url={mode === 'link' ? searchPageUrl : undefined}
			>
				<button
					className='raffle-search-widget__trigger'
					aria-label='Search'
				>
					<svg
						width='18'
						height='18'
						viewBox='0 0 24 24'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
						aria-label='Search'
					>
						<circle
							cx='11'
							cy='11'
							r='7'
							stroke='currentColor'
							strokeWidth='2'
							fill='none'
						/>
						<line
							x1='16.5'
							y1='16.5'
							x2='22'
							y2='22'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
						/>
					</svg>
				</button>
			</div>
		);
	},
});
