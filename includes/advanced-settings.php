<?php

/**
 * Advanced settings for the Raffle Search plugin.
 *
 * Handles the registration of post_tag taxonomy for pages and ensures
 * full UI and REST support when enabled in the plugin settings.
 */

// Register post_tag for pages only if enabled in settings
add_action( 'init', function() {
if ( get_option( 'raffle_search_enable_tags_on_pages', false ) ) {
register_taxonomy_for_object_type( 'post_tag', 'page' );
}
}, 0 );
// Fallback: ensure taxonomy is registered before saving page
add_action( 'save_post_page', function( $post_id ) {
if ( get_option( 'raffle_search_enable_tags_on_pages', false ) ) {
register_taxonomy_for_object_type( 'post_tag', 'page' );
}
}, 1 );
// Ensure 'post_tag' is in the 'taxonomies' property for 'page' post type for full UI and REST support
add_action( 'init', function() {
if ( get_option( 'raffle_search_enable_tags_on_pages', false ) ) {
global $wp_post_types;
if ( isset( $wp_post_types['page'] ) ) {
$taxonomies = $wp_post_types['page']->taxonomies;
if ( ! in_array( 'post_tag', $taxonomies, true ) ) {
$wp_post_types['page']->taxonomies[] = 'post_tag';
}
}
}
}, 20 );
// Add REST and admin column support for post_tag on pages for full UI functionality
add_action( 'init', function() {
if ( get_option( 'raffle_search_enable_tags_on_pages', false ) ) {
global $wp_taxonomies;
if ( isset( $wp_taxonomies['post_tag'] ) ) {
// Add REST and admin column support
$wp_taxonomies['post_tag']->object_type[] = 'page';
$wp_taxonomies['post_tag']->show_admin_column = true;
$wp_taxonomies['post_tag']->show_in_rest = true;
}
}
}, 30 );
// Add REST and admin column support for post_tag on pages for full UI functionality
add_action( 'init', function() {
	if ( get_option( 'raffle_search_enable_tags_on_pages', false ) ) {
		global $wp_taxonomies;
		if ( isset( $wp_taxonomies['post_tag'] ) ) {
			// Add REST and admin column support
			$wp_taxonomies['post_tag']->object_type[] = 'page';
			$wp_taxonomies['post_tag']->show_admin_column = true;
			$wp_taxonomies['post_tag']->show_in_rest = true;
		}
	}
}, 30 );
// Ensure 'post_tag' is in the 'taxonomies' property for 'page' post type for full UI and REST support
add_action( 'init', function() {
	if ( get_option( 'raffle_search_enable_tags_on_pages', false ) ) {
		global $wp_post_types;
		if ( isset( $wp_post_types['page'] ) ) {
			$taxonomies = $wp_post_types['page']->taxonomies;
			if ( ! in_array( 'post_tag', $taxonomies, true ) ) {
				$wp_post_types['page']->taxonomies[] = 'post_tag';
			}
		}
	}
}, 20 );