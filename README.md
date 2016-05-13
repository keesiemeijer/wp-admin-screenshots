# WP Admin Screenshots #

Version: 1.0.0-alpha  

Create screenshots of all WordPress wp-admin pages found in the admin menu from a local or remote site.

See the screenshots taken with this script for WordPress 4.5 admin pages in the [screenshots directory](https://github.com/keesiemeijer/wp-admin-screenshots/tree/master/screenshots). 

**Note**: Customizer pages are excluded for now. They will get a seperate command in future.

**Note**:The Screen Options for the user that this script logs in with are changed by default to show all meta boxes. Create a dummy user to log in with, or use the `--check-screen-options=false` sub command to keep the Screen Options as they are.

### Requirements
[CasperJS](http://casperjs.org/) (installed and executable)

At least on of the following is required for CasperJS.
[PhantomJS](http://phantomjs.org/) (installed and executable)
[SlimerJS](https://slimerjs.org/) (installed and executable)

To test if a requirement is installed and executable open your terminal and check the version.

```bash
# for PhantomJS
phantomjs --version

# for CasperJS
casperjs --version

# for SlimerJS
slimerjs --version
```

If you get an error instead of a version number it's not installed and executable globally.

### CLI command
The command to take the wp-admin screenshots

```
SYNOPSIS
  casperjs screenshot.js http://example.com

  
OPTIONS

  <website>
    Website. The screenshot.js script tries to login at <website>/wp-login.php  

  [--admin_user=<username>]
    Name of the user. Default is 'admin'
	 
  [--admin_password=<password>]
    The password for the admin user. Default is 'password'

  [--check-screen-options=<boolean>]
    Whether to check all Screen Options checkboxes. Default is true.

  [--show-screen-options=<boolean>]
    Whether to display the Screen Options in the schreenshots. Default is false.

  [--viewport-width=<number>]
    The width of the screenshots. Default 1024

  [--save_dir=<directory name>]
    name of the directory where to save the screenshots. Default directory is derived from the website domain. The directory will be created in the same directory where you use this command

EXAMPLE
    
    casperjs wp-admin-screenshots.js http://example.com --viewport-width=375 --save_dir=mobile

```

### Install

Clone this repo and go to the wp-admin-screenshots folder in your terminal.

```bash
# Clone the repo
git clone https://github.com/keesiemeijer/wp-admin-screenshots.git

# cd into WP Admin Screenshots directory
cd wp-admin-screenshots
```

### Examples

Change the viewport width to 375px.
```bash
casperjs wp-admin-screenshots.js http://example.com --admin_user=admin --admin_password=password --viewport-width=375
```

Same example as above but using SlimerJS.
```bash
casperjs --engine=slimerjs wp-admin-screenshots.js http://example.com --admin_user=admin --admin_password=password --viewport-width=375
```