.. _pages/mobile/theming#theming:

Theming
*******

CSS and SCSS   
============

Theming in qooxdoo mobile is done with `SCSS <http://www.sass-lang.com/>`_. SCSS is an extension for CSS to enable style sheets to be more dynamic.
In SCSS you can you use variables, reuse CSS statements inside of a SCSS file, import CSS files and create mixins. 

Despite we use SCSS, you do not to be a SCSS expert. The main parts of the SCSS are used and maintained by us in our framework. You just need to have some knowledge about CSS.

If you want to extend or change the qooxdoo mobile themes, you should always modify the SCSS files (\*.scss) in the folder
``<APP_ROOT>/source/resource/<APP_NAME>/mobile/scss``. After you modified SCSS files, they have to be compiled into CSS. Otherwise you will not see
any changes. 

qx.Mobile provides a built-in SCSS compiler called `pyScss <https://github.com/Kronuz/pyScss>`_. This compiler is used by our ``watch-scss`` job. You do not need to install the 
ruby SASS compiler through gem, as mentioned on official SASS website.

Parsing SCSS files
==================

Layout design through CSS is typically done by trial-and-error method. 
You often change a stylesheet and reload the qx.Mobile application many times. 

When using SCSS you would have to parse the SCSS file after each change of your stylesheet files.

To automatically parse the SCSS on change/save, you can use our generator job: 

::

    ./generate.py watch-scss


It recognizes any changes made to the SCSS files in your qx.Mobile application and triggers the 
compiling to CSS automatically.

qx.Mobile themes 
================

qx.Mobile provides a theme for the iOS platform and one theme for the Android platform.
These themes are not intended to be changed/customized by developers.

The third one of our themes is the "Indigo" theme. This theme can be modified by developers 
in many ways, like setting colors or change the used border radius etc.

Extending the iOS or Android theme
==================================

You can add your own the CSS rules on top of the iOS or Android theme.

Just append your statements them to the following file:

 ``<APP_ROOT>/source/resource/<APP_NAME>/mobile/css/styles.css``

Change theme in your qx.Mobile application
==========================================

You can change the used theme of your qx.Mobile application by opening the ``config.json``
in your application root. 
There you find the macro called ``MOBILE_THEME``.
You can change the macro to one of the following values:

* ``ios``
* ``android``
* ``custom`` 

After changing this macro you have to run the source job in your application's root:

::

  ./generate.py source

 
Customized theme for your qx.Mobile application
===============================================

In the qx.Mobile Showcase you can have a look at our default theme, called 'Indigo'.
You can use and modify this theme in many ways. 

For customization, please follow these steps:

  1.  For enabling the customized theming, you have to change the variable ``MOBILE_THEME`` in your ``<APP_ROOT>/config.json`` 
      to ``custom``:

      ::

          "MOBILE_THEME" : "custom"

      After changing the variable please run 

      ::

          ./generate.py source

      once.

  2.  Now start the SCSS watch job by running 

      ::

          ./generate.py watch-scss
  
      in your application's root.

  3.  Have a look in your application's resource folder:
      ``<APP_ROOT>/source/resource/<APP_NAME>/mobile/scss/_custom.scss``

      This is the key file for customizing our default theme to your needs.

      At ``_custom.scss`` you find variables for the customization of your qx.Mobile application.

      The variables overwrite the default theme "Indigo". Undeclared variables get styled
      like in the "Indigo" theme.

  4.  Give it a try: Change the background of the NavigationBar to the color ``green``:
      
      ::
      
          $navigationbar-background-color: green;

      Your customized theme is compiled automatically by the SCSS watch job to: ``<APP_ROOT>/source/resource/<APP_NAME>/mobile/css/styles.css``

  5.  Reload your qx.Mobile application and check your changes. It should look like this:

      .. image:: customizedTheme.png
        :scale: 50%

That is all you need to know for customizing the theme of a qx.Mobile app. Try the other
SCSS variables of your ``_custom.scss``!

Extending the customized theme with SCSS
========================================

Additionally to the customization of the variables in ``_custom.scss`` you can extend the theme with your own CSS/SCSS rules. In this case
you can append your SCSS/CSS statement to the following file:

``<APP_ROOT>/source/resource/<APP_NAME>/mobile/scss/styles.scss``

Please make sure not to change or delete any of the import statements.

More about SCSS
===============

As mentioned before, you do not need to be an expert in SCSS for theming. 
But if you want to know more about this exciting CSS enhancement technology, please have a look at the SASS website:

* `SASS official website <http://www.sass-lang.com/>`_

Improving your layouting workflow
=================================

We have a little hint for you, for improving the layouting workflow of your qx.Mobile application.

There is a plug-in for Google Chrome called **CSS Auto Reload**:

* `CSS Auto Reload for Chrome <https://chrome.google.com/webstore/detail/css-auto-reload/fiikhcfekfejbleebdkkjjgalkcgjoip>`_

This plug-in recognizes when a website's CSS has changed and updates the CSS automatically, without a reload of the site. 
This plug-in works perfectly in combination with our SCSS watch-job. 

The result: You just have to change a qx.Mobile's SCSS, save it and the qx.Mobile application in Chrome
updates after a few seconds, and keeps the current state of the application.
