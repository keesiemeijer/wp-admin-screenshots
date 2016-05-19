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
	do_extras();
};

function do_extras() {
	// casper.echo( "I'am doing extras" );
}