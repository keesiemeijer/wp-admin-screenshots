var require = patchRequire( require ),
	utils = require( 'utils' );

function _sanitize_filename( filename ) {
	filename = filename.toLowerCase();
	filename = filename.replace( /\.php/g, '' );
	filename = filename.replace( /\W/g, '-' );

	return filename;
}


function _toggle_screen_options( casper ) {

	if ( !( casper.exists( '#screen-options-wrap' ) && casper.exists( '#screen-meta' ) ) ) {
		return;
	}

	if ( casper.visible( '#screen-options-wrap' ) ) {
		casper.evaluate( function() {
			document.getElementById( "screen-meta" ).setAttribute( 'style', 'display:none !important' );
			document.getElementById( 'screen-options-wrap' ).setAttribute( 'style', 'display:none !important' );
		} );

		casper.waitWhileVisible( '#screen-options-wrap', function() {
			casper.echo( "Closed screen options" );
		} );
	} else {

		casper.evaluate( function() {
			document.getElementById( "screen-meta" ).setAttribute( 'style', 'display:block !important' );
			document.getElementById( 'screen-options-wrap' ).setAttribute( 'style', 'display:block !important' );
		} );

		casper.waitUntilVisible( '#screen-options-wrap', function() {
			casper.echo( "Opened screen options." );
		} );
	}
};

function _take_screenshot( file, dimensions, casper) {

	var filename = _sanitize_filename( file );
	var dir = casper.options[ 'screenshot_options' ][ 'save_dir' ];

	if ( dir.length ) {
		filename = dir + '/' + filename + ".png";

		casper.capture( filename, dimensions );
		casper.echo( 'Taking screenshot...' );
	} else {
		casper.echo( 'Could not take screenshot. Directory parameter missing.' );
	}
}


exports.get_menu_items = function( css_selector, casper ) {
	links = casper.evaluate( function( css_selector ) {
		var elements = __utils__.findAll( css_selector );

		elements = elements.map( function( e ) {
			var href = e.getAttribute( 'href' );
			if ( 0 !== href.indexOf( "customize.php" ) ) {
				return href;
			}
		} );

		return elements.filter( function( item ) {
			return typeof item === 'string';
		} );
	}, css_selector );

	return utils.unique( links );;
}


exports.take_screenshot = function( file, dimensions, casper ) {
  _take_screenshot( file, dimensions, casper);	
};


exports.check_screen_options_checkboxes = function( casper ) {

	if ( casper.exists( '#screen-options-wrap' ) ) {
		if ( !casper.visible( '#screen-options-wrap' ) ) {
			_toggle_screen_options( casper );
		}

		casper.evaluate( function() {
			var nodes = document.querySelectorAll( '#screen-options-wrap input[type="checkbox"]' );

			for ( var i = 0; i < nodes.length; i++ ) {
				if ( !nodes[ i ].checked ) {
					nodes[ i ].click();
				}
			}
		} );

		casper.wait( 1000, function() {
			casper.echo( "Checked screen options." );
		} );
	}
};

exports.loop = function( url, links, options, casper ) {
	casper.each( links, function( self, link, i ) {

		casper.thenOpen( url + '/wp-admin/' + link, function() {

			casper.emit( 'after.wp_admin_open', link );

			//set the viewport to the desired height and width
			casper.viewport( options[ 'viewport-width' ], 400 );

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

				//dimensions = filters.get_dimensions( link, dimensions );

				_take_screenshot( link, dimensions, casper )

				casper.emit( 'after.screenshot', link );
			} );

			casper.then( function() {
				casper.wait( 2000 );
			} );
		} );
	} );
};

exports.toggle_screen_options = function( casper ) {
	_toggle_screen_options( casper );
};

exports.sanitize_filename = function( filename ) {
	_sanitize_filename( filename );
};