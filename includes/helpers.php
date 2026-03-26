<?php
// Helper: sanitize comma-separated types
function raffle_search_sanitize_types($value) {
	$types = array_filter(array_map('trim', explode(',', $value)));
	$types = array_map('strtolower', $types);
	$types = array_unique($types);
	return implode(',', $types);
}
