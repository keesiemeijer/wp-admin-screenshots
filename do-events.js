// events
var require = patchRequire( require ),
	utils = require( 'utils' ),
	fs = require( 'fs' ),
	functions = require( './functions' ),
	casper,
	options;

// use casper instance
exports.init = function( instance ) {
	casper = instance;
	options = casper.options[ 'screenshot_options' ];
	do_events();
};


function do_events() {

	// Filter admin links. Use this to set the admin links to take screenshots for.
	// casper.on( 'wp_admin_links', set_admin_links );

	// Get submenu links (WP < 2.7)
	casper.on( 'open_wp_admin_link', get_submenu_links );

	// remove get_submenu_links event listner
	casper.on( 'after_wp_admin_loop', remove_get_submenu_links_action );

	// Check screen options after opening page
	casper.on( 'open_wp_admin_link', check_screen_options );

	// Opens closed meta boxes
	casper.on( 'open_wp_admin_link', open_meta_boxes );

	// Allows you to take extra screenshots. 
	casper.on( 'after.screenshot', do_extra );
}


var set_admin_links = function() {
	casper.options[ 'wp_admin_links' ] = [ 'post-new.php' ];
}

var get_submenu_links = function( parent_link ) {
	casper.then( function() {
		// parent links
		var parent_links = casper.options[ 'wp_admin_links' ];
		var child_links = casper.options[ 'wp_admin_submenu_links' ];

		if ( casper.exists( '#submenu' ) ) {

			var admin_links = functions.get_menu_items( '#submenu a', casper );

			admin_links = functions.sanitize_links( admin_links );

			// Check if it's not a parent link
			admin_links = admin_links.filter( function( link ) {
				return ( ( parent_links.indexOf( link ) === -1 ) || ( parent_link !== link ) );
			} );

			if ( admin_links.length ) {
				casper.echo( 'Getting sub menu item links' );
				child_links = utils.unique( child_links.concat( admin_links ) );
				casper.options[ 'wp_admin_submenu_links' ] = child_links;
			}
			//utils.dump( casper.options[ 'wp_admin_submenu_links' ] );
		}
	} );
}


var remove_get_submenu_links_action = function() {
	casper.echo( 'removing get_submenu_links action' );
	casper.removeListener( 'open_wp_admin_link', get_submenu_links );
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

var do_extra = function( link ) {
	file = functions.sanitize_filename( link ) + '.js';
	var path = 'pages/' + file;

	if ( fs.exists( path ) && fs.isReadable( path ) ) {
		var page = require( './' + path );
		page.init( link, casper );
	}
}