<?php
// Helper: sanitize comma-separated types

function raffle_search_sanitize_types($value) {
	$types = array_filter(array_map('trim', explode(',', $value)));
	$types = array_map('strtolower', $types);
	$types = array_unique($types);
	return implode(',', $types);
}

// Helper to get the default image URL from plugin settings or fallback
function raffle_search_get_default_image_url() {
	$url = get_option('raffle_search_default_image_url', '');
	if ($url && filter_var($url, FILTER_VALIDATE_URL)) {
		return $url;
	}
	// fallback to plugin asset
	return plugins_url('assets/logo.svg', dirname(__FILE__, 2));
}