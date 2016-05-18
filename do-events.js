// events
var require = patchRequire( require ),
	utils = require( 'utils' ),
	functions = require( './functions' ),
	casper,
	options;

// use casper instance
exports.instance = function( instance ) {
	casper = instance;
	options = casper.options[ 'screenshot_options' ];
	do_events();
};


function do_events() {

	// Filter admin links. Use this to set the admin links to take screenshots for.
	// casper.on( 'wp_admin_links', set_admin_links );

	// Check screen options after opening page
	casper.on( 'after.open_wp_admin_link', check_screen_options );

	// Opens closed meta boxes
	casper.on( 'after.open_wp_admin_link', open_meta_boxes );
}


var set_admin_links = function() {
	casper.options[ 'wp_admin_links' ] = [ 'post-new.php' ];
}


var check_screen_options = function( link ) {
	casper.then( function() {

		if ( !( casper.exists( '#show-settings-link' ) && options[ 'check-screen-options' ] ) ) {
			return;
		}

		if ( casper.exists( '#screen-options-wrap' ) ) {
			if ( !casper.visible( '#screen-options-wrap' ) ) {
				functions.toggle_screen_options( casper );
			}

			functions.check( '#screen-options-wrap input[type="checkbox"]', casper );

			casper.wait( 1000, function() {
				casper.echo( "Checked screen options." );
			} );
		}
	} );
}


var open_meta_boxes = function( link ) {
	casper.then( function() {
		if ( casper.exists( '.postbox.closed' ) ) {

			functions.set_attribute( '.postbox.closed', 'class', 'postbox', casper );

			casper.wait( 1000, function() {
				casper.echo( "Opened (closed) meta boxes." );
			} );
		}
	} );
}