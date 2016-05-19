var utils = require( 'utils' ),
	functions = require( './functions' ),
	events = require( './do-events' ),
	base_url = '',
	defaults = {
		'admin_user': 'admin',
		'admin_password': 'password',
		'check-screen-options': true,
		'show-screen-options': false,
		'viewport-width': 1024,
		'save_dir': ''
	};

var casper = require( 'casper' ).create( {
	// verbose: true,
	// logLevel: "debug"
} );

// Check cli args
if ( casper.cli.args.length === 0 ) {
	casper.echo( "Please provide an url" );
} else {
	base_url = casper.cli.args[ 0 ];
	defaults[ 'save_dir' ] = base_url.replace( /\W/g, '-' ).replace( /^https?-+/, '' );
}

var options = utils.mergeObjects( defaults, casper.cli.options );

if ( !utils.isNumber( options[ 'viewport-width' ] ) ) {
	options[ 'viewport-width' ] = 1024;
}

// Add options to casper.options
casper.options[ 'screenshot_options' ] = options;
casper.options[ 'wp_admin_links' ] = [];
casper.options[ 'wp_admin_submenu_links' ] = [];

// utils.dump( options );

// casper.on( 'remote.message', function( msg ) {
// 	this.echo( 'remote message caught: ' + msg );
// } );

events.init( casper );

// Open /wp-login.php
if ( base_url.length ) {
	// start casper and check if /wp-login.php exists
	casper.start( base_url + "/wp-login.php", function() {
		if ( this.status().currentHTTPStatus !== 200 ) {
			this.echo( 'Could not open: ' + base_url + "/wp-login.php" ).exit();
		}
	} );
}


// Log in
casper.then( function() {
	if ( this.exists( '#loginform' ) ) {
		var user_login = user_pass = '';

		var user = [ 'user_login', 'log' ];
		var pass = [ 'user_pass', 'pwd' ];

		var user_login = user.filter( function( selector ) {
			return casper.exists( '#loginform input#' + selector );
		} );

		var user_pass = pass.filter( function( selector ) {
			return casper.exists( '#loginform input#' + selector );
		} );

		if ( user_pass.length && user_login.length ) {
			var login = {};
			login[ '#' + user_login ] = options[ 'admin_user' ];
			login[ '#' + user_pass ] = options[ 'admin_password' ];

			this.echo( "logging in at " + base_url + "/wp-login.php" )
			this.fillSelectors( '#loginform', login, true );

			// wait for wp-admin
			this.waitForUrl( /wp-admin\/?/, function() {
				this.echo( 'Logged in!' );
			} );
		} else {
			this.echo( "Login fields not found" ).exit();
		}

	} else {
		this.echo( "Login form not found" ).exit();
	}
} );


// Get admin pages from admin menu
casper.then( function() {

	var top_level = '';
	var selector = [ '#adminmenu', '#sidemenu' ];
	var admin_links = [];

	for ( var i = 0; i < selector.length; i++ ) {
		if ( this.exists( selector[ i ] ) ) {
			var pages = functions.get_menu_items( selector[ i ] + ' a', casper );
			if ( pages.length ) {
				admin_links = admin_links.concat( pages );
			}
		}
	};

	// make wp_admin_links filterable in the 'wp_admin_links' action
	casper.options[ 'wp_admin_links' ] = functions.sanitize_links( admin_links );

	casper.emit( 'wp_admin_links' );

	var found_links = casper.options[ 'wp_admin_links' ].length;

	if ( found_links ) {
		this.echo( found_links + top_level + " admin links found\n" );
	} else {
		this.echo( "No admin links found" ).exit();
	}
} );


//Loop through admin pages and take a screenshot
casper.then( function() {
	this.echo( "Admin loop started" );
	casper.emit( 'before_wp_admin_loop' );
	functions.loop( base_url, casper.options[ 'wp_admin_links' ], options, casper );
} );

casper.then( function() {
	this.echo( "Admin loop finished" );
	casper.emit( 'after_wp_admin_loop' );
} );

//Loop through submenu pages and take a screenshot
casper.then( function() {
	if ( casper.options[ 'wp_admin_submenu_links' ].length ) {
		this.echo( "Admin submenu loop started" );
		casper.emit( 'before_wp_admin_submenu_loop' );
		functions.loop( base_url, casper.options[ 'wp_admin_submenu_links' ], options, casper );
	}
} );

casper.then( function() {
	this.echo( "Admin submenu loop finished" );
	casper.emit( 'after_wp_admin_submenu_loop' );
} );


// Let's do this!
casper.run( function() {
	this.echo( 'Finished' ).exit();
} );