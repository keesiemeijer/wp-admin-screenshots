// Example of extra screenshots
var require = patchRequire( require ),
	utils = require( 'utils' ),
	functions = require( './functions' ),
	name = 'post-new',
	casper,
	options;

// use casper instance
exports.init = function( link, instance ) {
	casper = instance;
	options = casper.options[ 'screenshot_options' ];
	take_screenshot_submitdiv();
};

function take_screenshot_submitdiv() {

	if ( !casper.exists( '#submitdiv' ) ) {
		return;
	}

	var edit_selectors = [
		'.edit-visibility', '.edit-post-status', '.edit-timestamp'
	];
	var selectors = [ '#post-visibility-select', '#post-status-select', '#timestampdiv' ];

	casper.then( function() {

		functions.css_display( edit_selectors, 'none', casper );
		functions.css_display( selectors, 'block', casper );

		casper.waitUntilVisible( '#timestampdiv', function() {
			casper.scrollTo( 0, 0 );
		} );
	} );


	casper.then( function() {
		var save_dir = functions.get_option( 'save_dir', casper );
		casper.echo( "Taking screenshot of submit metabox..." );

		casper.captureSelector( save_dir + '/post-new-submit.png', '#submitdiv' );
	} );
}