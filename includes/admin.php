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
	// Media upload field for default image
	function raffle_search_field_default_image_url() {
		$value = get_option( 'raffle_search_default_image_url', '' );
		$img_preview = $value ? '<img src="' . esc_url( $value ) . '" style="max-width:100px;max-height:100px;display:block;margin-bottom:8px;" />' : '';
		?>
		<div id="raffle-search-default-image-upload">
			<?php echo $img_preview; ?>
			<input type="url" id="raffle_search_default_image_url" name="raffle_search_default_image_url" value="<?php echo esc_attr( $value ); ?>" class="regular-text" placeholder="https://..." />
			<button type="button" class="button" id="raffle_search_default_image_upload_btn"><?php esc_html_e( 'Upload or Select Image', 'raffle-search' ); ?></button>
			<p class="description"><?php esc_html_e( 'Select or upload a default image to use when no image is found in search results.', 'raffle-search' ); ?></p>
		</div>
		<script>
		(function($){
			$(function(){
				var frame;
				$('#raffle_search_default_image_upload_btn').on('click', function(e){
					e.preventDefault();
					if (frame) { frame.open(); return; }
					frame = wp.media({
						title: '<?php echo esc_js( __( 'Select or Upload Default Image', 'raffle-search' ) ); ?>',
						button: { text: '<?php echo esc_js( __( 'Use this image', 'raffle-search' ) ); ?>' },
						multiple: false
					});
					frame.on('select', function(){
						var attachment = frame.state().get('selection').first().toJSON();
						$('#raffle_search_default_image_url').val(attachment.url).trigger('change');
						$('#raffle-search-default-image-upload img').remove();
						$('#raffle-search-default-image-upload').prepend('<img src="'+attachment.url+'" style="max-width:100px;max-height:100px;display:block;margin-bottom:8px;" />');
					});
					frame.open();
				});
			});
		})(jQuery);
		</script>
		<?php
	}
	$value = get_option( 'raffle_search_hide_summary_button', false );
	?>
<label for="raffle_search_hide_summary_button">
    <input type="checkbox" id="raffle_search_hide_summary_button" name="raffle_search_hide_summary_button" value="1"
        <?php checked( 1, $value ); ?> />
    <?php esc_html_e( 'Hide the "Learn More" button in the AI summary.', 'raffle-search' ); ?>
</label>
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
	   $logo_url = plugins_url( 'assets/logo.svg', dirname( __FILE__ ) );
	?>
<div class="wrap">
    <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 24px;">
        <img src="<?php echo esc_attr( $logo_url ); ?>" alt="Raffle Search Logo"
            style="height: 64px; width: 64px; background: #12151f; border-radius: 8px;" />
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