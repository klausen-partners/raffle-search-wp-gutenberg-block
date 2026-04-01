	<?php
require_once __DIR__ . '/helpers.php';

/**
 * Admin settings page for the Raffle Search plugin.
 *
 * Adds a "Raffle Search" submenu under Settings and provides fields
 * to store baseUrl and searchUid in the WordPress database.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Register the settings submenu page.
function raffle_search_add_settings_page() {
	add_submenu_page(
		'options-general.php',
		__( 'Raffle Search', 'raffle-search' ),
		__( 'Raffle Search', 'raffle-search' ),
		'manage_options',
		'raffle-search-settings',
		'raffle_search_render_settings_page'
	);
}
add_action( 'admin_menu', 'raffle_search_add_settings_page' );

// Register settings, sections, and fields.
function raffle_search_register_settings() {
	// Register option to enable meta tag output for post/page tags
	register_setting(
		'raffle_search_options',
		'raffle_search_enable_article_tag_meta',
		array(
			'type' => 'boolean',
			'sanitize_callback' => 'rest_sanitize_boolean',
			'default' => false,
		)
	);

	// Register default image URL option
	register_setting(
		'raffle_search_options',
		'raffle_search_default_image_url',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'esc_url_raw',
			'default'           => '',
		)
	);
	register_setting(
		'raffle_search_options',
		'raffle_search_base_url',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'esc_url_raw',
			'default'           => 'https://api.raffle.ai/v2',
		)
	);

	register_setting(
		'raffle_search_options',
		'raffle_search_excerpt_trim_length',
		array(
			'type'              => 'integer',
			'sanitize_callback' => 'raffle_search_sanitize_trim_length',
			'default'           => null,
		)
	);

	register_setting(
		'raffle_search_options',
		'raffle_search_uid',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => '',
		)
	);

	register_setting(
		'raffle_search_options',
		'raffle_search_show_references',
		array(
			'type'              => 'boolean',
			'sanitize_callback' => 'rest_sanitize_boolean',
			'default'           => true,
		)
	);

	register_setting(
		'raffle_search_options',
		'raffle_search_hide_summary_button',
		array(
			'type'              => 'boolean',
			'sanitize_callback' => 'rest_sanitize_boolean',
			'default'           => false,
		)
	);

	register_setting(
		'raffle_search_options',
		'raffle_search_hide_excerpt_types',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'raffle_search_sanitize_types',
			'default'           => 'pdf',
		)
	);

	add_settings_section(
		'raffle_search_main_section',
		__( 'API Configuration', 'raffle-search' ),
		'raffle_search_section_description',
		'raffle-search-settings'
	);
	
	add_settings_field(
		'raffle_search_base_url',
		__( 'Base URL', 'raffle-search' ),
		'raffle_search_field_base_url',
		'raffle-search-settings',
		'raffle_search_main_section'
	);


	add_settings_field(
		'raffle_search_uid',
		__( 'Search UID', 'raffle-search' ),
		'raffle_search_field_search_uid',
		'raffle-search-settings',
		'raffle_search_main_section'
	);

	add_settings_field(
		'raffle_search_show_references',
		__( 'Show References', 'raffle-search' ),
		'raffle_search_field_show_references',
		'raffle-search-settings',
		'raffle_search_main_section'
	);

	add_settings_field(
		'raffle_search_hide_summary_button',
		__( 'Hide summary button', 'raffle-search' ),
		'raffle_search_field_hide_summary_button',
		'raffle-search-settings',
		'raffle_search_main_section'
	);

	add_settings_field(
		'raffle_search_excerpt_trim_length',
		__( 'Excerpt trim Length', 'raffle-search' ),
		'raffle_search_field_excerpt_trim_length',
		'raffle-search-settings',
		'raffle_search_main_section'
	);

	add_settings_field(
		'raffle_search_hide_excerpt_types',
		__( 'Hide excerpts for Types', 'raffle-search' ),
		'raffle_search_field_hide_excerpt_types',
		'raffle-search-settings',
		'raffle_search_main_section'
	);

	add_settings_field(
		'raffle_search_default_image_url',
		__( 'Default Result Image', 'raffle-search' ),
		'raffle_search_field_default_image_url',
		'raffle-search-settings',
		'raffle_search_main_section'
	);

	// Move this field to the end
	add_settings_field(
		'raffle_search_enable_article_tag_meta',
		__( 'Add article:tag meta', 'raffle-search' ),
		'raffle_search_field_enable_article_tag_meta',
		'raffle-search-settings',
		'raffle_search_main_section'
	);


// Field for enabling article:tag meta
	function raffle_search_field_enable_article_tag_meta() {
		$value = get_option( 'raffle_search_enable_article_tag_meta', false );
		?>
	<label for="raffle_search_enable_article_tag_meta">
	    <input type="checkbox" id="raffle_search_enable_article_tag_meta" name="raffle_search_enable_article_tag_meta"
	        value="1" <?php checked( 1, $value ); ?> />
	    <?php esc_html_e( 'Add a meta tag with all post/page tags as a string array (article:tag) in the page head.', 'raffle-search' ); ?>
	</label>
	<?php
}
	
function raffle_search_field_hide_excerpt_types() {
	$value = get_option( 'raffle_search_hide_excerpt_types', 'pdf' );
	?>
	<input type="text" id="raffle_search_hide_excerpt_types" name="raffle_search_hide_excerpt_types"
	    value="<?php echo esc_attr( $value ); ?>" class="regular-text" placeholder="pdf,docx" />
	<p class="description">
	    <?php esc_html_e( 'Comma-separated list of result types (e.g. pdf,docx) for which excerpts/snippets should be hidden. You can add your own types.', 'raffle-search' ); ?>
	</p>
	<?php
}
function raffle_search_field_hide_summary_button() {
	$value = get_option( 'raffle_search_hide_summary_button', false );
	?>
	<label for="raffle_search_hide_summary_button">
	    <input type="checkbox" id="raffle_search_hide_summary_button" name="raffle_search_hide_summary_button" value="1"
	        <?php checked( 1, $value ); ?> />
	    <?php esc_html_e( 'Hide the "Learn More" button in the AI summary.', 'raffle-search' ); ?>
	</label>
	<?php
}

function raffle_search_field_default_image_url() {
	$value = get_option( 'raffle_search_default_image_url', '' );
	$img_preview = $value ? '<img src="' . esc_url( $value ) . '" style="max-width:100px;max-height:100px;display:block;margin-bottom:8px;" />' : '';
	?>
	<div id="raffle-search-default-image-upload">
	    <?php echo $img_preview; ?>
	    <input type="url" id="raffle_search_default_image_url" name="raffle_search_default_image_url"
	        value="<?php echo esc_attr( $value ); ?>" class="regular-text" placeholder="https://..." />
	    <button type="button" class="button"
	        id="raffle_search_default_image_upload_btn"><?php esc_html_e( 'Upload or Select Image', 'raffle-search' ); ?></button>
	    <p class="description">
	        <?php esc_html_e( 'Select or upload a default image to use when no image is found in search results.', 'raffle-search' ); ?>
	    </p>
	</div>
	<script>
(function($) {
    $(function() {
        var frame;
        $('#raffle_search_default_image_upload_btn').on('click', function(e) {
            e.preventDefault();
            if (frame) {
                frame.open();
                return;
            }
            frame = wp.media({
                title: '<?php echo esc_js( __( 'Select or Upload Default Image', 'raffle-search' ) ); ?>',
                button: {
                    text: '<?php echo esc_js( __( 'Use this image', 'raffle-search' ) ); ?>'
                },
                multiple: false
            });
            frame.on('select', function() {
                var attachment = frame.state().get('selection').first().toJSON();
                $('#raffle_search_default_image_url').val(attachment.url).trigger('change');
                $('#raffle-search-default-image-upload img').remove();
                $('#raffle-search-default-image-upload').prepend('<img src="' + attachment
                    .url +
                    '" style="max-width:100px;max-height:100px;display:block;margin-bottom:8px;" />'
                );
            });
            frame.open();
        });
    });
})(jQuery);
	</script>
	<?php
}
}
add_action( 'admin_init', 'raffle_search_register_settings' );

function raffle_search_section_description() {
	echo '<p>' . esc_html__( 'Enter your Raffle AI credentials. Find these in the Raffle Web App under your API User Interface settings.', 'raffle-search' ) . '</p>';
}

function raffle_search_field_base_url() {
	$value = get_option( 'raffle_search_base_url', 'https://api.raffle.ai/v2' );
	?>
	<input type="url" id="raffle_search_base_url" name="raffle_search_base_url" value="<?php echo esc_attr( $value ); ?>"
	    class="regular-text" placeholder="https://api.raffle.ai/v2" />
	<p class="description">
	    <?php esc_html_e( 'The Raffle API base URL. Defaults to https://api.raffle.ai/v2.', 'raffle-search' ); ?></p>
	<?php
}

function raffle_search_field_search_uid() {
	$value = get_option( 'raffle_search_uid', '' );
	?>
	<input type="password" id="raffle_search_uid" name="raffle_search_uid" value="<?php echo esc_attr( $value ); ?>"
	    class="regular-text" placeholder="D2FF7152-8089-41A9-A65D-E82111A11E49" autocomplete="off" />
	<button type="button" onclick="
		var f = document.getElementById('raffle_search_uid');
		if (f.type === 'password') { f.type = 'text'; this.textContent = 'Hide'; } else { f.type = 'password'; this.textContent = 'Show'; }
	" style="margin-left:8px;">Show</button>
	<p class="description">
	    <?php esc_html_e( 'The UID of your Raffle Search UI (Tool UID). Found in the Install modal of your tool in the Raffle Web App.', 'raffle-search' ); ?>
	</p>
	<?php
}

function raffle_search_field_show_references() {
	$value = get_option( 'raffle_search_show_references', true );
	?>
	<label for="raffle_search_show_references">
	    <input type="checkbox" id="raffle_search_show_references" name="raffle_search_show_references" value="1"
	        <?php checked( 1, $value ); ?> />
	    <?php esc_html_e( 'Display the References list below the AI summary.', 'raffle-search' ); ?>
	</label>
	<?php
}

// Render the settings page.
// Sanitize the trim length: allow null or positive integer
function raffle_search_sanitize_trim_length( $value ) {
	if ( $value === '' || is_null( $value ) ) {
		return null;
	}
	$int = intval( $value );
	return $int > 0 ? $int : null;
}

function raffle_search_field_excerpt_trim_length() {
	$value = get_option( 'raffle_search_excerpt_trim_length', null );
	?>
	<input type="number" id="raffle_search_excerpt_trim_length" name="raffle_search_excerpt_trim_length"
	    value="<?php echo esc_attr( $value ); ?>" class="small-text" min="1" placeholder="None" />
	<p class="description">
	    <?php esc_html_e( 'Maximum number of characters to show in each result excerpt/snippet. Leave blank for no trimming.', 'raffle-search' ); ?>
	</p>
	<?php
}
function raffle_search_render_settings_page() {
	   if ( ! current_user_can( 'manage_options' ) ) {
		   return;
	   }
	   // Ensure media scripts are loaded for uploader
	   if ( function_exists( 'wp_enqueue_media' ) ) {
		   wp_enqueue_media();
	   }
	?>
	<div class="wrap">
	    <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 24px;">
	        <div style="height: 64px; width: 64px; background: #12151f; border-radius: 8px;">
	            <svg id="icon" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 500 500">
	                <!-- Generator: Adobe Illustrator 30.2.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 1)  -->
	                <defs>
	                    <style>
	                    .st0 {
	                        fill: #fff;
	                    }

	                    .st1 {
	                        fill: #12151f;
	                    }
	                    </style>
	                </defs>
	                <rect id="bg" class="st1" width="500" height="500" />
	                <g id="txt">
	                    <g>
	                        <path class="st0"
	                            d="M175.3,182.3h-.3s-17.7,2.7-17.7,2.7h-.7c-2.8.6-5.3,1.4-7.7,2.3-2.6,1.1-4.8,2.5-6.8,4.4s-3.5,4-4.6,6.5-1.7,5.3-1.7,8.6.6,5.5,1.7,8.1c1.1,2.6,2.7,4.9,4.9,6.9,2.1,2,4.7,3.6,7.8,4.8,3.1,1.2,6.5,1.8,10.3,1.8s9.8-1.1,13.2-3.2c3.5-2.1,6.1-4.6,8-7.5,0,1.4,0,2.9.2,4.6.1,1.6.3,2.8.5,3.8v.2h17.9v-.3c-.2-1.2-.4-2.9-.6-4.9-.2-1.9-.3-3.8-.3-5.5v-.7s0-35.5,0-35.5v-.6c0-3.4-.6-6.6-1.7-9.8-1.1-3.3-2.9-6.2-5.4-8.7-2.5-2.5-5.7-4.5-9.7-6s-8.8-2.3-14.5-2.3-9.1.7-12.8,2.1c-1.4.5-2.8,1.2-4,1.8l9.2,13.6c2.1-1.3,4.7-1.9,7.8-1.9s7.1.9,9.1,2.8c2,1.9,3,4.1,3,6.6s-.4,2.4-1.2,3.3c-.7.9-2.1,1.5-3.9,1.8ZM180.4,197.3v.5c0,3-.5,5.5-1.3,7.5-.9,2.1-2,3.8-3.5,5.1-1.5,1.3-3.1,2.2-5,2.8-1.9.5-3.9.8-5.9.8-3.1,0-5.4-.9-7-2.6-1.6-1.7-2.3-3.6-2.3-5.8s.9-5,2.6-6.4,3.8-2.3,6.3-2.7l16.2-3v3.7Z" />
	                        <path class="st0"
	                            d="M222.8,126.7c-2.3,2.3-4,5.2-5.3,8.4-1.2,3.3-1.8,7-1.8,11.1v8.2h-12v16.7h12v55.4h19.6v-55.4h27.7v55.4h19.4v-55.4h29.2v23.2h0v6.6c0,7.8,2.4,14.1,6.9,18.7l.3.3c4.7,4.7,10.9,7.1,18.7,7.1s3.9-.1,5.7-.4c1.8-.3,4.4-1,5.2-1.4-2.2-4.1-3.7-6.9-4.6-8.4-2.2-4-3.4-6.3-3.7-6.8-1.1.1-2,.1-2.5,0-.8-.2-2.2-.8-3.3-1.5s-1.8-1.7-2.5-2.9c-.6-1.2-.9-2.8-.9-4.8h0v-80.2h-19.4v34h-29.2v-8.3c0-1.9.4-3.4.9-4.6.6-1.3,1.5-2.3,2.5-3,1-.7,2.1-1.2,3.3-1.5,1.2-.3,2.3-.4,3.4-.4,1.7,0,3,0,3.9.2,1,.1,1.7.3,2.2.5v-16.4h-.2c-.8-.4-2-.8-3.7-1-1.8-.3-3.7-.4-5.8-.4-7.9,0-14.2,2.4-18.9,7.3-4.7,4.8-7.1,11.4-7.1,19.6v8.2h-27.7v-8.3c0-1.9.4-3.4.9-4.6.6-1.3,1.5-2.3,2.5-3,1-.7,2.1-1.2,3.3-1.5,1.2-.3,2.3-.4,3.4-.4,1.7,0,3,0,3.9.2,1,.1,1.7.3,2.2.5v-16.4h-.2c-.8-.4-2-.8-3.7-1-1.8-.3-3.7-.4-5.8-.4-4,0-7.6.6-10.8,1.9-3.2,1.3-6,3.1-8.2,5.4Z" />
	                        <path class="st0"
	                            d="M378.5,152.2c-4.6,0-9,.9-13.3,2.7-4.3,1.8-8.1,4.3-11.3,7.6-3.3,3.3-5.9,7.3-7.8,11.9-1.9,4.7-2.9,9.9-2.9,15.7s1,11.5,3,16.3c2,4.8,4.7,8.8,8.1,12.2,3.4,3.3,7.3,5.8,11.8,7.5,4.5,1.7,9.2,2.6,14.2,2.6s8.4-.6,12-1.8c.6-.2,1.1-.4,1.6-.6l-8.5-14.8c-1.5.3-3.2.5-5,.5s-4.7-.4-6.9-1.2c-2.1-.8-4-2-5.6-3.4-1.6-1.5-2.9-3.2-3.9-5.2-1-2-1.6-4.2-1.7-6.5h51.4c0-.3,0-1,.1-2.1,0-1.2.1-2.5.1-3.9,0-11.6-3.1-20.8-9.3-27.4-6.2-6.6-14.9-10-26.1-10ZM362.7,182.2v-.4c.2-1.5.6-3,1.2-4.6.7-1.7,1.8-3.2,3.1-4.5,1.4-1.4,3-2.5,5-3.4,1.9-.9,4.2-1.3,6.7-1.3s5.1.4,7.1,1.2c2,.8,3.7,1.9,5,3.2,1.3,1.3,2.3,2.8,2.9,4.5.6,1.7,1,3.4,1.1,5.2h-32.1Z" />
	                        <path class="st0"
	                            d="M106.1,186.6v-.5c.2-8.2,4.3-13.1,12.1-13.1s10.1,2.7,13.2,9.4l18.2-8.4-.3-.7c-6.3-13.2-17.1-20.5-31-20.5-19.9,0-32.2,14.8-32.2,33.7v40.3h20v-40.3Z" />
	                        <path class="st0" d="M406.2,214.9c0-3.3-2.7-6-6-6s-6,2.7-6,6,2.7,6,6,6,6-2.7,6-6Z" />
	                    </g>
	                    <g>
	                        <path class="st0"
	                            d="M131,264.1c-.7-3.8-2.5-6.8-5.5-9-3-2.2-6.8-3.3-11.4-3.3s-8.9,1.2-11.9,3.5c-3,2.3-4.5,5.4-4.5,9.1s1.1,5.5,3.3,7.5c2.2,2,5.8,3.7,10.9,5.1l7.8,2.1c7.3,1.9,12.7,4.5,16.2,7.7,3.6,3.2,5.3,7.5,5.3,12.8s-1,7.5-2.9,11c-1.9,3.5-4.9,6.3-9,8.5-4.1,2.2-9.3,3.3-15.8,3.3s-9.9-.9-13.9-2.7-7.2-4.3-9.6-7.5c-2.4-3.2-3.7-7-4-11.4h9.6c.5,4.2,2.6,7.4,6.1,9.6,3.6,2.2,7.8,3.3,12.7,3.3s9.4-1.2,12.6-3.7c3.2-2.5,4.8-5.7,4.8-9.6s-1.2-5.8-3.6-7.8c-2.4-2-6.2-3.7-11.4-5.2l-9.4-2.7c-6-1.7-10.7-4.2-14.2-7.4-3.4-3.2-5.2-7.4-5.2-12.5s1.2-8,3.5-11.2c2.3-3.2,5.5-5.7,9.4-7.5,4-1.8,8.4-2.7,13.3-2.7s9.3.9,13.1,2.7c3.8,1.8,6.8,4.2,9.1,7.4,2.2,3.1,3.5,6.7,3.7,10.8h-9.3Z" />
	                        <path class="st0"
	                            d="M178.8,322.2c-5.8,0-10.7-1.3-14.7-3.9-4-2.6-6.9-6.1-8.9-10.6s-3-9.6-3-15.3,1-10.8,3.1-15.2c2-4.5,5-8,8.8-10.6,3.9-2.6,8.5-3.9,14-3.9s8.6,1,12.5,2.9c4,1.9,7.2,5,9.7,9.3,2.5,4.3,3.7,9.9,3.7,17v3.7h-42.8c.5,6.2,2.4,10.8,5.6,13.9,3.2,3.1,7.1,4.6,11.7,4.6s6.8-.8,9.7-2.5c3-1.7,5.1-3.9,6.5-6.6l7.9,3.4c-1.7,4.1-4.7,7.4-8.9,9.9-4.2,2.5-9.2,3.7-14.9,3.7ZM178.3,270.7c-4.8,0-8.7,1.5-11.7,4.5-3,3-4.8,7.3-5.4,12.8h34.1c0-3.2-.7-6.2-2-8.8-1.4-2.6-3.3-4.7-5.8-6.3s-5.5-2.3-9-2.3Z" />
	                        <path class="st0"
	                            d="M251.1,321v-7.8h-.4c-.6,1.2-1.6,2.6-3,4-1.4,1.4-3.3,2.6-5.6,3.6-2.3,1-5.2,1.5-8.5,1.5s-7-.7-9.9-2.1c-3-1.4-5.3-3.3-7.1-5.9-1.7-2.6-2.6-5.7-2.6-9.2s.9-6.7,2.6-9c1.7-2.4,4-4.3,6.7-5.7,2.8-1.4,5.7-2.5,8.8-3.2,3.1-.7,6.1-1.2,9-1.6,2.9-.3,5.3-.6,7.3-.8l2.7-.3v-.7c0-4.1-1.3-7.4-3.8-9.8-2.5-2.4-5.9-3.6-10.2-3.6-6.7,0-11.5,3.1-14.2,9.4l-8.2-3.1c1.1-3.1,2.7-5.6,4.5-7.4,1.9-1.9,3.9-3.3,6-4.2,2.1-1,4.2-1.6,6.3-1.9,2.1-.3,3.9-.5,5.4-.5,3.9,0,7.6.7,11.1,2.2,3.5,1.4,6.3,3.8,8.5,7.2s3.3,7.8,3.3,13.4v35.5h-8.8ZM251.1,292.4h-1.8c-1.2.2-2.8.4-4.9.5-2.1.1-4.4.4-6.9.8-2.5.4-4.8,1.1-7.1,1.9-2.2.9-4.1,2.1-5.5,3.6-1.4,1.5-2.1,3.5-2.1,5.9s1.1,5.2,3.3,6.8c2.2,1.6,4.7,2.5,7.7,2.5s7.1-.7,9.6-2.1c2.6-1.4,4.5-3.1,5.8-5.3,1.3-2.2,1.9-4.5,1.9-6.9v-7.8Z" />
	                        <path class="st0"
	                            d="M304.4,262.9v9.1c-.4,0-1.1-.1-1.8-.2-.8,0-1.7,0-2.8,0-3.2,0-5.9.8-8.2,2.5s-4,3.8-5.3,6.3-1.9,5-1.9,7.5v32.9h-8.8v-57.5h8.8v9.9h.6c.5-1.8,1.6-3.6,3.1-5.2,1.5-1.6,3.4-3,5.5-4,2.1-1,4.3-1.5,6.5-1.5s3.5,0,4.3.3Z" />
	                        <path class="st0"
	                            d="M359.4,280.8h-8.8c-.7-2.8-2.3-5.1-4.7-7.1-2.4-2-5.6-2.9-9.5-2.9s-6.3.9-8.8,2.8c-2.5,1.8-4.5,4.4-5.9,7.6-1.4,3.2-2.1,7-2.1,11.2s.7,8.2,2.2,11.5c1.4,3.3,3.4,5.9,5.9,7.7,2.5,1.8,5.4,2.8,8.6,2.8s6.9-.9,9.4-2.7c2.5-1.8,4.2-4.2,5-7.4h8.8c-.5,3.4-1.7,6.4-3.7,9.2-2,2.7-4.6,4.9-7.9,6.4-3.3,1.6-7.2,2.4-11.6,2.4s-9.6-1.3-13.4-3.8c-3.8-2.5-6.8-6.1-8.9-10.6-2.1-4.5-3.1-9.7-3.1-15.6s1-10.8,3.1-15.3,5-7.9,8.8-10.4c3.8-2.5,8.3-3.8,13.5-3.8s7.7.7,11,2.2c3.3,1.5,6.1,3.6,8.2,6.3s3.5,5.8,4,9.4Z" />
	                        <path class="st0"
	                            d="M380.5,286.3v34.7h-8.8v-76.7h8.8v27.3h.6c1.4-2.2,3.5-4.2,6.3-6,2.8-1.9,6.4-2.8,10.7-2.8s9.8,1.8,13.3,5.5c3.5,3.7,5.2,9.1,5.2,16.2v36.5h-8.8v-36.5c0-4.2-1.1-7.4-3.4-9.7-2.3-2.3-5.3-3.4-9.2-3.4s-4.7.5-6.9,1.5c-2.3,1-4.2,2.6-5.7,4.8-1.5,2.2-2.2,5.1-2.2,8.7Z" />
	                    </g>
	                    <g>
	                        <path class="st0"
	                            d="M111.9,356.3v3.4c0,2.3-.5,4.4-1.5,6.3-1,1.9-2.4,3.4-4.2,4.5-1.8,1.1-4.1,1.7-6.6,1.7s-4.7-.6-6.7-1.8c-2-1.2-3.5-3-4.7-5.4s-1.7-5.4-1.7-8.9.6-6.5,1.7-8.9c1.1-2.4,2.7-4.2,4.7-5.4,2-1.2,4.2-1.8,6.7-1.8s4.2.4,6,1.3c1.7.9,3.1,2,4.2,3.5,1.1,1.5,1.7,3.1,2,4.8h-4c-.2-1-.6-2-1.3-3s-1.6-1.7-2.8-2.4c-1.2-.6-2.5-.9-4.1-.9-2.8,0-5,1.1-6.7,3.3-1.7,2.2-2.6,5.3-2.6,9.4s.3,4.6.8,6.2c.6,1.6,1.3,2.9,2.2,3.8.9.9,1.9,1.6,3,1.9,1.1.4,2.1.6,3.2.6s2.7-.3,4-.9c1.3-.6,2.4-1.5,3.3-2.9.9-1.3,1.3-3.1,1.3-5.3h-7.4v-3.4h11.3Z" />
	                        <path class="st0"
	                            d="M132.9,362.6v-14.2h3.6v23.5h-3.6v-3.3h-.2c-.6.9-1.4,1.7-2.6,2.5s-2.6,1.1-4.4,1.1-2.3-.3-3.5-.9c-1.2-.6-2.1-1.6-2.9-2.9-.8-1.3-1.2-3-1.2-5v-14.9h3.6v14.9c0,1.7.5,3,1.4,4s2.2,1.4,3.7,1.4,1.8-.2,2.7-.6,1.7-1.1,2.4-2c.6-.9,1-2.1,1-3.5Z" />
	                        <path class="st0"
	                            d="M153,348.4v3.4h-5v13.4c0,1.1.2,2,.6,2.4.4.5.9.8,1.5.9s1.1.2,1.5.2.5,0,.7,0c.2,0,.4,0,.7,0v3.3c-.3,0-.6.2-.8.2s-.7,0-1.5,0-1.9-.2-2.9-.6c-1-.4-1.8-1.1-2.5-1.9-.7-.9-1-2-1-3.4v-14.4h-3.8v-3.4h3.8v-5h3.6v5h5Z" />
	                        <path class="st0"
	                            d="M167.5,372.3c-2.4,0-4.4-.5-6-1.6s-2.8-2.5-3.7-4.3-1.2-3.9-1.2-6.2.4-4.4,1.2-6.2c.8-1.8,2-3.3,3.6-4.3,1.6-1.1,3.5-1.6,5.7-1.6s3.5.4,5.1,1.2c1.6.8,2.9,2.1,3.9,3.8,1,1.7,1.5,4.1,1.5,6.9v1.5h-17.5c.2,2.5,1,4.4,2.3,5.7,1.3,1.3,2.9,1.9,4.8,1.9s2.8-.3,4-1c1.2-.7,2.1-1.6,2.6-2.7l3.2,1.4c-.7,1.7-1.9,3-3.6,4-1.7,1-3.7,1.5-6.1,1.5ZM167.3,351.3c-2,0-3.6.6-4.8,1.9s-2,3-2.2,5.2h13.9c0-1.3-.3-2.5-.8-3.6-.6-1.1-1.4-1.9-2.4-2.6s-2.3-.9-3.7-.9Z" />
	                        <path class="st0"
	                            d="M186.5,358v13.9h-3.6v-23.5h3.6v4h.2c.6-1.2,1.4-2.2,2.6-3,1.2-.8,2.6-1.2,4.4-1.2s4,.7,5.4,2.2c1.4,1.5,2.1,3.7,2.1,6.7v14.9h-3.6v-14.7c0-1.7-.5-3.1-1.4-4.1-1-1-2.2-1.5-3.7-1.5s-1.8.2-2.7.7-1.7,1.2-2.4,2.1c-.6.9-1,2.2-1,3.6Z" />
	                        <path class="st0"
	                            d="M207.7,340.6h3.6v10.8h.4c.6-.9,1.4-1.7,2.5-2.3,1.1-.6,2.4-.9,4-.9s3.9.5,5.5,1.5c1.6,1,2.8,2.4,3.7,4.2.9,1.8,1.3,3.9,1.3,6.4s-.4,4.6-1.3,6.4c-.9,1.8-2.1,3.3-3.7,4.3-1.6,1-3.4,1.5-5.5,1.5s-3.1-.3-4.1-1c-1.1-.7-1.9-1.4-2.5-2.4h-.4l-.2,2.9h-3.3v-31.3ZM211.5,364c.2,1,.7,1.9,1.4,2.7s1.5,1.4,2.4,1.8c.9.4,1.9.6,2.9.6s2.5-.4,3.5-1.1c1-.7,1.8-1.8,2.4-3.1.6-1.3.9-2.9.9-4.7,0-2.7-.7-4.9-2-6.4-1.3-1.6-3-2.4-4.9-2.4s-2.9.5-4.1,1.4c-1.2.9-2,2.1-2.5,3.5-.2.8-.4,1.6-.4,2.3s0,1.3,0,1.6,0,.9,0,1.6c0,.8.2,1.5.4,2.3Z" />
	                        <path class="st0"
	                            d="M243.7,372.3c-2.4,0-4.4-.5-6-1.6s-2.8-2.5-3.7-4.3-1.2-3.9-1.2-6.2.4-4.4,1.2-6.2c.8-1.8,2-3.3,3.6-4.3,1.6-1.1,3.5-1.6,5.7-1.6s3.5.4,5.1,1.2,2.9,2.1,3.9,3.8c1,1.7,1.5,4.1,1.5,6.9v1.5h-17.5c.2,2.5,1,4.4,2.3,5.7,1.3,1.3,2.9,1.9,4.8,1.9s2.8-.3,4-1c1.2-.7,2.1-1.6,2.6-2.7l3.2,1.4c-.7,1.7-1.9,3-3.6,4-1.7,1-3.7,1.5-6.1,1.5ZM243.5,351.3c-2,0-3.6.6-4.8,1.9-1.2,1.2-2,3-2.2,5.2h13.9c0-1.3-.3-2.5-.8-3.6-.6-1.1-1.4-1.9-2.4-2.6-1-.6-2.3-.9-3.7-.9Z" />
	                        <path class="st0"
	                            d="M271,348.1v3.7c-.2,0-.4,0-.7,0-.3,0-.7,0-1.2,0-1.3,0-2.4.3-3.4,1s-1.7,1.5-2.2,2.6c-.5,1-.8,2-.8,3.1v13.4h-3.6v-23.5h3.6v4h.2c.2-.8.7-1.5,1.3-2.1.6-.7,1.4-1.2,2.2-1.6.9-.4,1.7-.6,2.7-.6s1.4,0,1.8.1Z" />
	                        <path class="st0"
	                            d="M290.9,348.5h3.6v23.8c0,1.8-.5,3.2-1.4,4.5-.9,1.2-2.2,2.2-3.7,2.8-1.6.7-3.3,1-5.2,1s-3-.2-4.2-.6c-1.2-.4-2.1-.9-2.9-1.6-.8-.6-1.4-1.3-1.9-2l2.7-2.1c.3.3.7.7,1.2,1.2.5.5,1.2.9,2,1.3.8.4,1.9.6,3.2.6,2,0,3.5-.5,4.8-1.4,1.2-.9,1.9-2.4,1.9-4.5v-2.8h-.4c-.6.9-1.4,1.6-2.5,2.2-1,.6-2.3.9-3.9.9s-3.9-.5-5.5-1.5-2.8-2.3-3.7-4.1-1.3-3.9-1.3-6.4.4-4.4,1.3-6.2c.9-1.8,2.1-3.1,3.7-4.1,1.6-1,3.4-1.5,5.6-1.5s3,.3,4,.9c1,.6,1.9,1.3,2.5,2.2h.3v-2.6ZM277.1,359.9c0,2.8.7,4.9,2,6.4,1.3,1.5,3,2.3,5,2.3s1.9-.2,2.8-.6,1.7-1,2.4-1.7c.7-.7,1.1-1.6,1.4-2.6.2-.7.3-1.4.4-2.2,0-.8,0-1.3,0-1.6s0-.8,0-1.4-.2-1.4-.4-2.2c-.4-1.4-1.2-2.5-2.4-3.4s-2.5-1.4-4.1-1.4-3.7.8-5.1,2.3-2,3.6-2,6.3Z" />
	                        <path class="st0"
	                            d="M323.9,371.9h-10.8v-31.3h10.3c2.1,0,3.9.4,5.3,1.2,1.5.8,2.6,1.8,3.4,3.1.8,1.3,1.2,2.6,1.2,4.1s-.4,2.9-1.2,4.1c-.8,1.3-1.9,2.2-3.3,2.9,1.8.4,3.2,1.2,4.2,2.4s1.6,2.7,1.6,4.6-.5,3.5-1.4,4.8c-.9,1.3-2.2,2.3-3.7,3s-3.4,1-5.5,1ZM316.9,343.9v10.5h7.3c1-.2,1.9-.5,2.7-1,.8-.5,1.4-1.2,1.9-1.9.5-.8.7-1.6.7-2.5s-.2-1.6-.7-2.4-1.1-1.4-2-1.9c-.9-.5-2-.7-3.4-.7h-6.5ZM330.7,363c0-1.8-.6-3.1-1.8-4-1.2-.9-2.8-1.3-4.8-1.3h-7.2v10.8h7c1.2,0,2.4-.2,3.4-.6,1-.4,1.9-1,2.5-1.8s.9-1.9.9-3.2Z" />
	                        <path class="st0" d="M343.6,340.6v31.3h-3.6v-31.3h3.6Z" />
	                        <path class="st0"
	                            d="M359.4,372.3c-2.2,0-4.1-.5-5.6-1.6-1.6-1-2.8-2.5-3.6-4.3s-1.3-4-1.3-6.4.4-4.4,1.3-6.2c.8-1.8,2.1-3.2,3.6-4.3s3.4-1.6,5.6-1.6c3.3,0,6,1.1,7.9,3.2,1.9,2.2,2.9,5.1,2.9,8.8s-.4,4.7-1.3,6.5-2.1,3.2-3.7,4.2c-1.6,1-3.5,1.5-5.7,1.5ZM359.4,369.1c2.2,0,3.9-.8,5.2-2.4s1.9-3.8,1.9-6.6-.6-4.9-1.9-6.5c-1.3-1.5-3-2.3-5.2-2.3s-2.6.4-3.7,1.1c-1,.8-1.8,1.8-2.4,3.1-.6,1.3-.8,2.8-.8,4.5s.3,3.2.8,4.5,1.3,2.4,2.3,3.2c1,.8,2.3,1.2,3.8,1.2Z" />
	                        <path class="st0"
	                            d="M394.1,355.4h-3.6c-.3-1.1-.9-2.1-1.9-2.9-1-.8-2.3-1.2-3.9-1.2s-2.6.4-3.6,1.1c-1,.8-1.8,1.8-2.4,3.1-.6,1.3-.9,2.8-.9,4.6s.3,3.4.9,4.7c.6,1.3,1.4,2.4,2.4,3.1s2.2,1.1,3.5,1.1,2.8-.4,3.8-1.1,1.7-1.7,2-3h3.6c-.2,1.4-.7,2.6-1.5,3.7-.8,1.1-1.9,2-3.2,2.6-1.3.6-2.9,1-4.7,1s-3.9-.5-5.5-1.6c-1.6-1-2.8-2.5-3.6-4.3-.9-1.8-1.3-4-1.3-6.4s.4-4.4,1.3-6.2c.9-1.8,2.1-3.2,3.6-4.3s3.4-1.5,5.5-1.5,3.2.3,4.5.9c1.4.6,2.5,1.5,3.3,2.6.9,1.1,1.4,2.4,1.6,3.9Z" />
	                        <path class="st0"
	                            d="M413.8,371.9l-8.3-10.8-2.8,3v7.8h-3.6v-31.3h3.6v18.4h.3l9.5-10.6h4.6l-9.2,10,10.2,13.4h-4.3Z" />
	                    </g>
	                </g>
	            </svg>
	        </div>
	        <h1 style="margin: 0; padding: 0;"><?php echo esc_html( get_admin_page_title() ); ?></h1>
	    </div>

	    <?php if ( isset( $_GET['settings-updated'] ) ) : ?>
	    <div class="notice notice-success is-dismissible">
	        <p><?php esc_html_e( 'Settings saved successfully.', 'raffle-search' ); ?></p>
	    </div>
	    <?php endif; ?>

	    <form method="post" action="options.php">
	        <?php
			settings_fields( 'raffle_search_options' );
			do_settings_sections( 'raffle-search-settings' );
			submit_button( __( 'Save Settings', 'raffle-search' ) );
		?>
	    </form>

	    <hr style="margin: 32px 0;" />
	    <div style="font-size: 13px; color: #666;">
	        <p>
	            <?php esc_html_e( 'This plugin is built and maintained by', 'raffle-search' ); ?>
	            <a href="https://klausenogpartners.dk" target="_blank" rel="noopener noreferrer">Klausen og Partners</a>.
	            <?php esc_html_e( 'The Raffle logo is owned by ', 'raffle-search' ); ?>
	            <a href="https://business.raffle.ai/about" target="_blank" rel="noopener noreferrer">Raffle</a>
	        </p>
	    </div>
	</div>

	<?php
}