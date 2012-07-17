What's in here
**************

* fonts/
  Fonts used by our website. (There used to be a copy of this folder in less/ (s.further); not sure why. Some .less file seem to reference them?!)
* images/
  Images, pictures, icons, the like.
* javascript/
  The scripts for the new (apr'12) web site.
* less/
  .less files to generate .css files from. They then go to stylesheets/ (s.further).
* stylesheets/
  CSS files, both static (sh*.css) and those generated from .less files.
* style/
  Old static .css files.


LESS
****

LESS extends CSS with dynamic behavior such as variables, mixins, operations and functions. LESS runs on both the client-side (IE 6+, Webkit, Firefox) and server-side, with Node.js and Rhino.

When used on the client-side, LESS loads the stylesheets via XHR, then parses and caches them (if possible). Changing files is effective immediately after reloading the page. No separate compilation process needs to be triggered.

* Learn more about LESS (http://lesscss.org/)
* Style settings (Colors, Dimensions) are found in less/settings.scss

Jekyll
******

Jekyll is a static site generator. It supports layouts (found in ``_layouts/``) and interprets a front matter declaration in the content HTML files. Once generated, the HTML files can be placed basically anywhere with no dependency whatsoever.

..

    # Install jekyll (you need Ruby)
    $ gem install jekyll

    # Generate (see ``_site/``) and deploy
    $ jekyll

    # Or: Run a server and automatically generate
    # Open http://localhost:4000
    $ jekyll --server --auto

* Learn more about Jekyll (https://github.com/mojombo/jekyll)

Resources
*********

    # Repeat for stylesheets, less, javascripts, images
    $ ln -s resources/stylesheets stylesheets

