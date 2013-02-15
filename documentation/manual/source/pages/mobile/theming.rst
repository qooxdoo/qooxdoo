.. _pages/mobile/theming#theming:

Theming
*******

CSS and SCSS   
============

Theming in qooxdoo mobile is done with `SCSS <http://www.sass-lang.com/>`_. SCSS is an extension for CSS to enable style sheets to be more modular and maintainable.
In SCSS you can you use variables,  create mixins, import other style files and reuse CSS statements. 

Despite our use of SCSS you do not have to be an SCSS expert. The main SCSS parts are maintained by us in the framework. You will usually just need some knowledge of CSS.

If you want to extend or change the qooxdoo mobile themes you should always
modify the SCSS files (\*.scss) in the folder
``<APP_ROOT>/source/resource/<APP_NAMESPACE>/mobile/scss``. After you modified
any SCSS files they have to be compiled into CSS, otherwise you will not see any
changes. 

.. _pages/mobile/theming#scss-compilation:

SCSS Compilation
================

%{Mobile} comes with a built-in SCSS compiler that can be used to leverage the changes
you make to your application's \*.scss files. You can either invoke it manually
through its ``tool/bin/scss.py`` frontend, or implicitly by running the
``watch-scss`` Generator job (see further).

Mind though that this compiler implements roughly version 3.2 of the SCSS
language, with some omissions. Some of the issues we have come across are:

* Data URLs get broken across lines.
* The ``...`` syntax for variable arguments in mixin *calls* is not supported.
* ``@-moz-document`` and ``@-*-keyframes`` statements are not understood (the subkeys are taken to be nested selectors).
* If the first argument to ``linear-gradient`` is a degree value (like ``-45deg``), an error will be printed (but the instruction is processed alright).

If you find you want to use one of those features, or want to use newer features
of SCSS, you might want to install the `SCSS reference implementation
<http://sass-lang.com/download.html>`_ which requires a `Ruby
<http://www.ruby-lang.org/>`_ and `Gem <http://rubygems.org/>`_ installation on
your machine. You can use the Ruby compiler everywhere you would use the qooxdoo
built-in compiler.

Watching SCSS files with qooxdoo's built-in SCSS compiler
---------------------------------------------------------

Layout design through CSS is typically done by experimentation. You often change a stylesheet and reload the corresponding application to see the effect. Using SCSS you would need to compile the SCSS file after each change of your stylesheet files.

To automatically compile the SCSS files on change/save, you can use the generator :ref:`watch-scss <pages/tool/generator/generator_default_jobs#watch-scss>` job: 

::

    ./generate.py watch-scss


It recognizes any changes made to the SCSS files in your qx.Mobile application and triggers the 
compilation to CSS automatically.

Watching SCSS files with SASS tool
----------------------------------

If you decide to use the official SASS compiler, please follow these steps for watching changes:

1. Switch to ``<APP_ROOT>/source/resource/<APP_NAME>/mobile/scss``

2. Start the built-in sass watching tool with:

::

    sass --watch .:../css

As mentioned before, it needs the official SASS compiler installed on your system.


qx.Mobile Themes 
================

qx.Mobile provides a theme for the iOS platform and one for Android.
These themes are not intended to be changed/customized by developers directly,
but can be extended.

The third one of our themes is the "Indigo" theme. This theme can be modified by developers 
in many ways, like setting colors or change the used border radius etc.

Switching themes in your qx.Mobile application
==============================================

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

 
Extending the iOS or Android theme
==================================

You can add your own CSS rules on top of the iOS or Android theme.  
Just append your statements to the following file:

 ``<APP_ROOT>/source/resource/<APP_NAME>/mobile/css/styles.css``

Using a custom theme
====================

In the qx.Mobile Showcase you can have a look at our default theme, called "Indigo".
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

    In ``_custom.scss`` you find various variables for the customization of your qx.Mobile application. The variables overwrite the default theme "Indigo". Undeclared variables get styled like in the "Indigo" theme.

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

As mentioned before, you do not need to be an expert in SCSS for theming. 
But if you want to know more about this exciting CSS enhancement technology, please have a look at the SASS website:

* `SASS official website <http://www.sass-lang.com/>`_

Improving your theming workflow
===============================

We have a little hint for you, for improving the layouting workflow of your qx.Mobile application.

There is a plug-in for Google Chrome called **CSS Auto Reload**:

* `CSS Auto Reload for Chrome <https://chrome.google.com/webstore/detail/css-auto-reload/fiikhcfekfejbleebdkkjjgalkcgjoip>`_

This plug-in recognizes when a website's CSS has changed and updates the CSS automatically, without a reload of the site. 
This plug-in works perfectly in combination with our SCSS watch-job. 

The result: You just have to change a qx.Mobile's SCSS, save it and the qx.Mobile application in Chrome
updates after a few seconds, and keeps the current state of the application.
