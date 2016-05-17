// events
var require = patchRequire( require ),
	utils = require( 'utils' ),
	casper,
	options;

// use casper instance
exports.instance = function( instance ) {
	casper = instance;
	options = casper.options[ 'screenshot_options' ];
	//do_events();
};

function do_events() {
	// casper.on( 'after.open_wp_admin_link', do_stuff );
}