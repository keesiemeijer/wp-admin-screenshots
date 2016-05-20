var require = patchRequire( require ),
	utils = require( 'utils' );


function _get_option( option, casper ) {
	if ( typeof casper.options[ 'screenshot_options' ][ option ] !== 'undefined' ) {
		return casper.options[ 'screenshot_options' ][ option ];
	}

	return false;
}


function _get_element_selector( selectors, casper ) {
	for ( var i = 0; i < selectors.length; i++ ) {
		if ( casper.exists( selectors[ i ] ) ) {
			return selectors[ i ];
		}
	}
	return false;
}


function _sanitize_filename( filename ) {
	filename = filename.toLowerCase();
	// remove .php
	filename = filename.replace( /\.php/g, '' );
	// replace non alphanumeric characters with a dash
	filename = filename.replace( /\W/g, '-' );
	// replace multiple dashes with one dash
	filename = filename.replace( /\-+/g, '-' );
	// replace dash at start
	filename = filename.replace( /^\-+/m, '-' );
	// replace dash at end
	filename = filename.replace( /\-+$/m, '-' );

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


function _css_display( selectors, type, casper ) {
	for ( var i = 0; i < selectors.length; i++ ) {
		if ( casper.exists( selectors[ i ] ) ) {
			_set_attribute( selectors[ i ], 'style', 'display:' + type + ';', casper );
		}
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


function _get_dimensions( casper ) {

	documentHeight = casper.evaluate( function() {
		return __utils__.getDocumentHeight();
	} );

	documentWidth = casper.options[ 'screenshot_options' ][ 'viewport-width' ];

	// Make dimensions filterable in the 'before_screenshot' action.
	return {
		top: 0,
		left: 0,
		width: documentWidth,
		height: documentHeight
	}
}


function _toggle_screen_options( casper ) {

	if ( !( casper.exists( '#screen-options-wrap' ) && casper.exists( '#screen-meta' ) ) ) {
		return;
	}

	if ( casper.visible( '#screen-options-wrap' ) ) {
		_css_display( [ "#screen-meta", "#screen-options-wrap" ], 'none !important', casper );

		casper.waitWhileVisible( '#screen-options-wrap', function() {
			casper.echo( "Closed screen options" );
		} );
	} else {
		_css_display( [ "#screen-meta", "#screen-options-wrap" ], 'block !important', casper );

		casper.waitUntilVisible( '#screen-options-wrap', function() {
			casper.echo( "Opened screen options." );
		} );
	}
}


function _take_screenshot( file, dimensions, casper ) {

	var filename = _sanitize_filename( file );
	var dir = _get_option( 'save_dir', casper );

	if ( dir.length ) {
		filename = dir + '/' + filename + ".png";

		casper.capture( filename, dimensions );
		casper.echo( 'Taking screenshot...' );
	} else {
		casper.echo( 'Could not take screenshot. Directory parameter missing.' );
	}
}


function _get_menu_items( css_selector, casper ) {
	items = casper.evaluate( function( css_selector ) {
		var elements = __utils__.findAll( css_selector );

		return elements.map( function( el ) {
			var href = el.getAttribute( 'href' );
			if ( typeof href === 'string' ) {
				return href;
			}
		} );

	}, css_selector );

	// Remove customizer links
	items = items.filter( function( el ) {
		if ( 0 !== el.indexOf( "customize.php" ) ) {
			return true;
		}
		return false;
	} );

	return utils.unique( _return_strings( items ) );
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

			casper.emit( 'open_wp_admin_link', link );

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

				// Make dimensions filterable in the 'before_screenshot' action.
				casper.options[ 'screenshot_dimensions' ] = _get_dimensions( casper );

				casper.emit( 'before_screenshot', link );
			} );

			casper.then( function() {
				_take_screenshot( link, casper.options[ 'screenshot_dimensions' ], casper )
			} );

			casper.then( function() {
				casper.emit( 'after.screenshot', link );
				casper.wait( 2000 );
			} );
		} );
	} );
};


exports.get_option = function( option, casper ) {
	return _get_option( option, casper );
}

exports.get_element_selector = function( selectors, casper ) {
	return _get_element_selector( selectors, casper );
}

exports.sanitize_filename = function( filename ) {
	return _sanitize_filename( filename );
};

exports.set_attribute = function( selector, attribute, value, casper ) {
	_set_attribute( selector, attribute, value, casper );
}

exports.css_display = function( selectors, type, casper ) {
	_css_display( selectors, type, casper );
}

exports.check = function( selector, casper ) {
	_check( selector, casper );
}

exports.get_dimensions = function( casper ) {
	return _get_dimensions( casper );
}

exports.toggle_screen_options = function( casper ) {
	_toggle_screen_options( casper );
};

exports.take_screenshot = function( file, dimensions, casper ) {
	_take_screenshot( file, dimensions, casper );
};

exports.get_menu_items = function( css_selector, casper ) {
	return _get_menu_items( css_selector, casper );
}

exports.sanitize_links = function( links ) {

	links = links.map( function( url ) {
		return _basename( url );
	} );

	return utils.unique( _return_strings( links ) );
};