var require = patchRequire( require );

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


exports.take_screenshot = function( file, dimensions, casper ) {

	var filename = _sanitize_filename( file );
	var dir = casper.options[ 'screenshot_options' ][ 'save_dir' ];

	if ( dir.length ) {
		filename = dir + '/' + filename + ".png";

		casper.capture( filename, dimensions );
		casper.echo( 'Taking screenshot...' );
	} else {
		casper.echo( 'Could not take screenshot. Directory parameter missing.' );
	}
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



exports.toggle_screen_options = function( casper ) {
	_toggle_screen_options( casper );
};

exports.sanitize_filename = function( filename ) {
	_sanitize_filename( filename );
};