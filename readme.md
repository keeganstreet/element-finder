Dependencies:
jsdom
commander
progress


Example usage:

elfinder -s .awesome-list
elfinder -s ".colours .awesome-list"
elfinder -s .awesome-list -x "html, shtml"
elfinder -s ".prod-row td" -i ".git, .svn, partials"

Intallation:

Make the element-finder.js script exectutable:
CD into the element-finder directory and run:
`chmod +x element-finder.js`

Add a symlink to the element-finder.js script from a directory in your PATH:
1. Check what your path variable is set to:
`echo $PATH`

2. Check that /usr/local/bin is in your path. If not:
`sudo mkdir /usr/local/bin`

3. Assuming that /usr/local/bin is present in your PATH, create a link from there to element-finder.js
`ln -s "/Users/kestreet/Dropbox/Projects/element-finder/element-finder.js" /usr/local/bin/elfinder`



Errors you might encounter:

`-bash: elfinder: command not found`
Have you created the symlink properly? Run `open /usr/local/bin/` and see if the elfinder link opens the element-finder.js script.


