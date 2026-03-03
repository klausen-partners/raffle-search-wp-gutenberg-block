import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import metadata from './block.json';
import './editor.css';

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => {
		// Dynamic block — frontend rendered by React via view.js.
		return (
			<div className="raffle-search-block wp-block-raffle-search-search"></div>
		);
	},
} );
