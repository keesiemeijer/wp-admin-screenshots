var utils = require( 'utils' ),
	casper = require( 'casper' ).create( {
		// verbose: true,
		// logLevel: "debug"
	} ),
	functions = require( './functions' ),
	filters = require( './filters' ),
	base_url = '',
	admin_links = [],
	submenu_links = [],
	defaults = {
		'admin_user': 'admin',
		'admin_password': 'password',
		'check-screen-options': true,
		'show-screen-options': false,
		'viewport-width': 1024,
		'save_dir': ''
	};

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

casper.options[ 'screenshot_options' ] = options;

// utils.dump( options );

// casper.on( 'remote.message', function( msg ) {
// 	this.echo( 'remote message caught: ' + msg );
// } );

filters.instance( casper );

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

		this.echo( "logging in at " + base_url + "/wp-login.php" )
		this.fillSelectors( '#loginform', {
			'#user_login': options[ 'admin_user' ],
			'#user_pass': options[ 'admin_password' ]
		}, true );

		// wait for wp-admin
		this.waitForUrl( /wp-admin\/?/, function() {
			this.echo( 'Logged in!' );
		} );

	} else {
		this.echo( "Login form not found" ).exit();
	}
} );


// Get admin pages from admin menu
casper.then( function() {

	var top_level = '';
	admin_links = functions.get_menu_items( '#adminmenu a', casper );

	if ( this.exists( '#sidemenu' ) ) {
		var sidemenu = functions.get_menu_items( '#sidemenu a', casper );
		if ( sidemenu.length ) {
			top_level = ' top level';
			admin_links = admin_links.concat( sidemenu );
		}
	}

	admin_links = utils.unique( admin_links );

	if ( admin_links.length ) {
		this.echo( admin_links.length + top_level + " admin links found\n" );
	} else {
		this.echo( "No admin links found" ).exit();
	}
} );


//Loop through admin pages and take a screenshot
casper.then( function() {
	functions.loop( base_url, admin_links, options, casper);
} );


// Let's do this!
casper.run( function() {
	this.echo( 'Finished' ).exit();
} );