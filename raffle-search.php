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
 * Icon:              assets/logo.svg
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
 * Load plugin text domain for translations.
 * Use plugins_loaded so the textdomain is ready before WPML or Polylang
 * switches the locale on init.
 */
function raffle_search_load_textdomain() {
	load_plugin_textdomain(
		'raffle-search',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
}
add_action( 'plugins_loaded', 'raffle_search_load_textdomain' );

/**
 * Reload the text domain when WPML switches the active language so that
 * both PHP strings and the script translation JSON use the correct locale.
 */
function raffle_search_reload_textdomain_on_wpml_switch() {
	unload_textdomain( 'raffle-search' );
	raffle_search_load_textdomain();
}
add_action( 'wpml_language_has_switched', 'raffle_search_reload_textdomain_on_wpml_switch' );

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
			'baseUrl'        => get_option( 'raffle_search_base_url', 'https://api.raffle.ai/v2' ),
			'searchUid'      => get_option( 'raffle_search_uid', '' ),
			'showReferences' => (bool) get_option( 'raffle_search_show_references', true ),
			'hideSummaryButton' => (bool) get_option( 'raffle_search_hide_summary_button', false ),
			'hideExcerptTypes' => get_option( 'raffle_search_hide_excerpt_types', 'pdf' ),
			'excerptTrimLength' => get_option( 'raffle_search_excerpt_trim_length', null ),
		)
	);

	wp_set_script_translations( $handle, 'raffle-search', RAFFLE_SEARCH_DIR . 'languages' );
}
add_action( 'enqueue_block_assets', 'raffle_search_localize_view_script' );

// Enqueue frontend script variable for default image
add_action( 'wp_enqueue_scripts', function() {
	if ( ! is_admin() ) {
		$default_image_url = function_exists('raffle_search_get_default_image_url') ? raffle_search_get_default_image_url() : '';
		// Enqueue the view script if not already enqueued
		$handle = 'raffle-search-view';
		if ( ! wp_script_is( $handle, 'enqueued' ) ) {
			$asset = include RAFFLE_SEARCH_DIR . 'build/view.asset.php';
			wp_enqueue_script(
				$handle,
				RAFFLE_SEARCH_URL . 'build/view.js',
				$asset['dependencies'],
				$asset['version'],
				true
			);
		}
		wp_localize_script(
			$handle,
			'raffleSearchDefaultImageUrl',
			$default_image_url
		);
	}
} );