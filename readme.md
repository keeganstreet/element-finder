# Element Finder

[![Build Status](https://travis-ci.org/keeganstreet/element-finder.png)](https://travis-ci.org/keeganstreet/element-finder)

Find in Files with CSS selectors.

Element Finder is a command line app for recursively searching through a directory and finding HTML files which contain elements matching a given CSS selector.


## Example usage

Search for elements with a class of `awesome-list`:

    elfinder -s .awesome-list

Search for elements with a class of `awesome-list` which are descendants of an element with a class of `colours`:

    elfinder -s ".colours .awesome-list"

Search for elements with a class of `awesome-list` in files with an extension of `html` or `shtml`:

    elfinder -s .awesome-list -x "html, shtml"

Search for elements matching the `ul.boxes .box` selector, but ignore any files in the `.git`, `.svn` or `partials` folders:

    elfinder -s "ul.boxes .box" -i ".git, .svn, partials"


## Installation with npm (recommended)

1. Install Node JS: http://nodejs.org/#download

2. Install elfinder globally with npm (npm comes with Node JS):

        npm install -g elfinder

Element Finder is a command line tool so it is best to install it globally with npm.


## Atom package

There is a package for Atom which is easier to use than the command line app. More info at https://github.com/keeganstreet/atom-element-finder
