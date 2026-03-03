<?php
/**
 * Plugin Name:       Raffle Search
 * Plugin URI:        https://raffle.ai
 * Description:       A Gutenberg block that integrates Raffle AI search (top questions, autocomplete, summary, and search results).
 * Version:           1.0.0
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Author:            Klausen and Partners
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       raffle-search
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'RAFFLE_SEARCH_VERSION', '1.0.0' );
define( 'RAFFLE_SEARCH_DIR', plugin_dir_path( __FILE__ ) );
define( 'RAFFLE_SEARCH_URL', plugin_dir_url( __FILE__ ) );

// Admin settings page.
require_once RAFFLE_SEARCH_DIR . 'includes/admin.php';

/**
 * Register the Gutenberg block.
 */
function raffle_search_register_block() {
	register_block_type( RAFFLE_SEARCH_DIR . 'build/block.json' );
}
add_action( 'init', 'raffle_search_register_block' );

/**
 * Pass plugin settings to the block's view script via wp_localize_script.
 */
function raffle_search_localize_view_script() {
	$handle = generate_block_asset_handle( 'raffle-search/search', 'viewScript' );

	wp_localize_script(
		$handle,
		'raffleSettings',
		array(
			'baseUrl'   => get_option( 'raffle_search_base_url', 'https://api.raffle.ai/v2' ),
			'searchUid' => get_option( 'raffle_search_uid', '' ),
		)
	);
}
add_action( 'enqueue_block_assets', 'raffle_search_localize_view_script' );