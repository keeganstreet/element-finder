# Element Finder

Find in Files with CSS selectors.

Element Finder is a command line app for recursively searching through a directory and finding HTML files which contain elements matching a given CSS selector. The app is built with Node JS and uses [Sizzle](http://sizzlejs.com/) as the selector engine - the same selector engine used by jQuery.


## Example usage

Search for elements with a class of `awesome-list`:

    elfinder -s .awesome-list

Search for elements with a class of `awesome-list` which are descendants of an element with a class of `colours`:

    elfinder -s ".colours .awesome-list"

Search for elements with a class of `awesome-list` in files with an extension of `html` or `shtml`:

    elfinder -s .awesome-list -x "html, shtml"

Search for elements matching the `ul.boxes .box` selector, but ignore any files in the `.git`, `.svn` or `partials` folders:

    elfinder -s "ul.boxes .box" -i ".git, .svn, partials"


## Intallation

1. Install Node JS: http://nodejs.org/#download

2. Get the Element Finder source. Download it or clone it from GitHub: https://github.com/keeganstreet/element-finder

3. CD into the element-finder directory

4. Install the dependencies with npm (npm comes with Node JS):

        npm install

5. Make the element-finder.js script exectutable:

        chmod +x element-finder.js

6. Add a symlink to the element-finder.js script from a directory in your PATH:

    6.1. Check what your path variable is set to:

        echo $PATH

    6.2. Check that /usr/local/bin is in your path. If not:

        sudo mkdir /usr/local/bin

    6.3. Assuming that /usr/local/bin is present in your PATH, create a link from there to element-finder.js

        ln -s "/Users/kestreet/Dropbox/Projects/element-finder/element-finder.js" /usr/local/bin/elfinder

7. Crack open a beer.


## Errors you might encounter

### -bash: elfinder: command not found

Have you created the symlink properly? Run `open /usr/local/bin/` and see if the `elfinder` link opens the `element-finder.js` script.

