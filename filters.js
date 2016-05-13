// filter dimensions of specific admin pages here
// todo: find better way to filter screenshot
var require = patchRequire( require ),
	utils = require( 'utils' ),
	casper,
	options;

// use casper instance
exports.instance = function( instance ) {
	casper = instance;
	options = casper.options[ 'screenshot_options' ];
};

// called before a screenshot is taken of an admin page
exports.get_dimensions = function( link, dimensions ) {
	dimensions = filter_dimensions( link, dimensions );
	return dimensions;
};

function filter_dimensions( link, dimensions ) {
	if ( 0 === link.indexOf( 'customize.php' ) ) {
		// do stuff for customizer pages dimensions
	}

	return dimensions;
}