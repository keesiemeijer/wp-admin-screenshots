var utils = require( 'utils' ),
	casper = require( 'casper' ).create(),
	functions = require( './functions' ),
	filters = require( './filters' ),
	url = '',
	admin_links = [],
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
	url = casper.cli.args[ 0 ];
	defaults[ 'save_dir' ] = url.replace( /\W/g, '-' ).replace( /^https?-+/, '' );
}

var options = utils.mergeObjects( defaults, casper.cli.options );

if ( !utils.isNumber( options[ 'viewport-width' ] ) ) {
	options[ 'viewport-width' ] = 1024;
}

casper.options[ 'screenshot_options' ] = options;

// utils.dump( options );

// casper.on('remote.message', function(msg) {
//     this.echo('remote message caught: ' + msg);
// });

filters.instance( casper );

// Open /wp-login.php
if ( url.length ) {
	// start casper and check if /wp-login.php exists
	casper.start( url + "/wp-login.php", function() {
		if ( this.status().currentHTTPStatus !== 200 ) {
			this.echo( 'Could not open: ' + url + "/wp-login.php" ).exit();
		}
	} );
}


// Log in
casper.then( function() {
	if ( this.exists( '#loginform' ) ) {

		this.echo( "logging in at " + url + "/wp-login.php" )
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
	links = this.evaluate( function() {
		var elements = __utils__.findAll( '#adminmenu a' );

		elements = elements.map( function( e ) {
			var href = e.getAttribute( 'href' );
			if ( 0 !== href.indexOf( "customize.php" ) ) {
				return href;
			}
		} );

		return elements.filter( function( item ) {
			return typeof item === 'string';
		} );
	} );

	admin_links = utils.unique( links );

	if ( admin_links.length ) {
		this.echo( admin_links.length + " admin links found\n" );
	} else {
		this.echo( "No admin links found" ).exit();
	}
} );


//Loop through admin pages and take a screenshot
casper.then( function() {

	casper.each( admin_links, function( self, link, i ) {

		casper.thenOpen( url + '/wp-admin/' + link, function() {

			//set the viewport to the desired height and width
			this.viewport( options[ 'viewport-width' ], 400 );

			casper.echo( "\nOpening " + url + '/wp-admin/' + link + ' at ' + options[ 'viewport-width' ] + 'px' );

			// wait for stuff to load (like in customizer)
			casper.then( function() {
				casper.wait( 2000 );
			} );

			casper.then( function() {
				if ( this.exists( '#show-settings-link' ) && options[ 'check-screen-options' ] ) {
					functions.check_screen_options_checkboxes( casper );
				}
			} );


			casper.then( function() {

				if ( !options[ "show-screen-options" ] ) {
					if ( this.visible( '#screen-options-wrap' ) ) {
						functions.toggle_screen_options( casper );
					}
				} else {
					if ( !this.visible( '#screen-options-wrap' ) ) {
						functions.toggle_screen_options( casper );
					}
				}
			} );


			casper.then( function() {
				casper.scrollTo( 0, 0 );

				documentHeight = casper.evaluate( function() {
					return __utils__.getDocumentHeight();
				} );

				var dimensions = {
					top: 0,
					left: 0,
					width: options[ 'viewport-width' ],
					height: documentHeight
				}

				dimensions = filters.get_dimensions( link, dimensions );

				functions.take_screenshot( link, dimensions, casper )

				casper.emit( 'after.screenshot', link );
			} );

			casper.then( function() {
				casper.wait( 2000 );
			} );
		} );
	} );
} );


// Let's do this!
casper.run( function() {
	this.echo( 'Finished' ).exit();
} );