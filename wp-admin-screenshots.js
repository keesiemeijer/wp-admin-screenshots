var utils = require( 'utils' ),
	casper = require( 'casper' ).create( {
		// verbose: true,
		// logLevel: "debug"
	} ),
	functions = require( './functions' ),
	//events = require( './events' ),
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

//events.instance( casper );

// submenus WP < 2.7
var submenu = function( link ) {

	if ( casper.exists( '#submenu' ) ) {
		var links = functions.get_menu_items( '#submenu a', casper );

		if ( links.length ) {
			links = functions.sanitize_links( links );

			links = links.filter( function( link ) {
				return ( links.indexOf( link ) > -1 );
			} );
		}

		if ( links.length ) {
			submenu_links = utils.unique( submenu_links.concat( links ) );
		}

		// utils.dump( submenu_links );
	};
}

// event listener to get submenu items when opening a top level admin page
casper.on( 'after.open_wp_admin_link', submenu );


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
	admin_links = functions.get_menu_items( '#adminmenu a', casper );

	if ( this.exists( '#sidemenu' ) ) {
		var sidemenu = functions.get_menu_items( '#sidemenu a', casper );
		if ( sidemenu.length ) {
			top_level = ' top level';
			admin_links = admin_links.concat( sidemenu );
		}
	}

	admin_links = functions.sanitize_links( admin_links );

	// utils.dump( admin_links );

	if ( admin_links.length ) {
		this.echo( admin_links.length + top_level + " admin links found\n" );
	} else {
		this.echo( "No admin links found" ).exit();
	}
} );


//Loop through admin pages and take a screenshot
casper.then( function() {
	functions.loop( base_url, admin_links, options, casper );
} );

//Loop through submenu pages and take a screenshot
casper.then( function() {
	if ( submenu_links.length ) {
		this.removeListener( 'after.open_wp_admin_link', submenu );
		functions.loop( base_url, submenu_links, options, casper );
	}
} );


// Let's do this!
casper.run( function() {
	this.echo( 'Finished' ).exit();
} );