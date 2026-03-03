<?php
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
		'raffle_search_uid',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => '',
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
<input type="text" id="raffle_search_uid" name="raffle_search_uid" value="<?php echo esc_attr( $value ); ?>"
    class="regular-text" placeholder="D2FF7152-8089-41A9-A65D-E82111A11E49" />
<p class="description">
    <?php esc_html_e( 'The UID of your Raffle Search UI (Tool UID). Found in the Install modal of your tool in the Raffle Web App.', 'raffle-search' ); ?>
</p>
<?php
}

// Render the settings page.
function raffle_search_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
<div class="wrap">
    <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

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
</div>
<?php
}