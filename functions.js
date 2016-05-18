var require = patchRequire( require ),
	utils = require( 'utils' );


function _sanitize_filename( filename ) {
	filename = filename.toLowerCase();
	filename = filename.replace( /\.php/g, '' );
	filename = filename.replace( /\W/g, '-' );

	return filename;
}


function _basename( url ) {

	// remove query parameters
	url = url.split( '?', 2 );

	// strip trailing slash
	basename = url[ 0 ].replace( /\/$/g, '' );
	// get last part of href
	basename = basename.substring( basename.lastIndexOf( '/' ) + 1 );

	if ( typeof url[ 1 ] !== 'undefined' ) {
		// add query parameters back
		basename = basename + '?' + url[ 1 ];
	}

	return basename;
}


function _return_strings( arr ) {
	return arr.filter( function( item ) {
		return typeof item === 'string';
	} );
}


function _set_attribute( selector, attribute, value, casper ) {
	if ( casper.exists( selector ) ) {
		casper.evaluate( function( selector, attribute, value ) {
			var elements = __utils__.findAll( selector );

			elements.map( function( el ) {
				el.setAttribute( attribute, value );
			} );

		}, selector, attribute, value );
	}
}

function _check( selector, casper ) {
	if ( casper.exists( selector ) ) {
		casper.evaluate( function( selector ) {
			var elements = __utils__.findAll( selector );

			elements.map( function( el ) {
				if ( !el.checked ) {
					el.click();
				}
			} );

		}, selector );
	}
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
}


function _take_screenshot( file, dimensions, casper ) {

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


function _get_menu_items( css_selector, casper ) {
	links = casper.evaluate( function( css_selector ) {
		var elements = __utils__.findAll( css_selector );

		return elements.map( function( e ) {
			var href = e.getAttribute( 'href' );
			if ( 0 !== href.indexOf( "customize.php" ) ) {
				return href;
			}
		} );

	}, css_selector );

	return utils.unique( _return_strings( links ) );
}


exports.loop = function( url, links, options, casper ) {
	casper.each( links, function( self, link, i ) {

		casper.thenOpen( url + '/wp-admin/' + link, function() {

			// Reset the viewport width to the desired height and width
			casper.viewport( options[ 'viewport-width' ], 400 );

			casper.echo( "\nOpening " + url + '/wp-admin/' + link + ' at ' + options[ 'viewport-width' ] + 'px' );

			// Wait for stuff to load (like in customizer)
			casper.then( function() {
				casper.wait( 2000 );
			} );

			casper.emit( 'after.open_wp_admin_link', link );

			casper.then( function() {

				if ( !options[ "show-screen-options" ] ) {
					if ( this.visible( '#screen-options-wrap' ) ) {
						_toggle_screen_options( casper );
					}
				} else {
					if ( !this.visible( '#screen-options-wrap' ) ) {
						_toggle_screen_options( casper );
					}
				}
			} );

			casper.then( function() {
				casper.scrollTo( 0, 0 );

				documentHeight = casper.evaluate( function() {
					return __utils__.getDocumentHeight();
				} );

				// Make dimensions filterable in the 'before_screenshot' action.
				casper.options[ 'screenshot_dimensions' ] = {
					top: 0,
					left: 0,
					width: options[ 'viewport-width' ],
					height: documentHeight
				}

				casper.emit( 'before_screenshot', link );

				_take_screenshot( link, casper.options[ 'screenshot_dimensions' ], casper )

				casper.emit( 'after.screenshot', link );
			} );

			casper.then( function() {
				casper.wait( 2000 );
			} );
		} );
	} );
};

exports.check = function( selector, casper ) {
	_check( selector, casper );
}

exports.set_attribute = function( selector, attribute, value, casper ) {
	_set_attribute( selector, attribute, value, casper );
}

exports.get_menu_items = function( css_selector, casper ) {
	return _get_menu_items( css_selector, casper );
}

exports.take_screenshot = function( file, dimensions, casper ) {
	_take_screenshot( file, dimensions, casper );
};


exports.toggle_screen_options = function( casper ) {
	_toggle_screen_options( casper );
};


exports.sanitize_filename = function( filename ) {
	_sanitize_filename( filename );
};


exports.sanitize_links = function( links ) {

	links = links.map( function( url ) {
		return _basename( url );
	} );

	return utils.unique( _return_strings( links ) );
};