import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import metadata from './block.json';
import './editor.css';

registerBlockType(metadata.name, {
	edit: Edit,
	save: ({ attributes }) => {
		// Dynamic block — frontend rendered by React via view.js.
		// data-search-uid is only written when a per-block UID is set so that
		// existing saved blocks (without the attribute) remain valid.
		return (
			<div
				className='raffle-search-block wp-block-raffle-search-search'
				data-search-uid={attributes.searchUid || undefined}
			></div>
		);
	},
});
