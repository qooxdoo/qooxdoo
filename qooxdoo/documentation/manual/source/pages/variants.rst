.. _pages/variants#working_with_variants:

Working with Variants
*********************

Variants enable the selection and removal of code from the build version.
A variant consists of a collection of states from which exactly one is active
at load time of the framework. The global map ``qxvariants`` can be 
used to select a variant before the Framework is loaded.

Depending on the selected variant a specific code path can be choosen using the ``select`` method.

The generator is able to set a variant and remove all code paths which are not
selected by the variant.

Variants are used to implement browser optimized builds and to remove debugging code from the build version.  It is very similar to conditional compilation in C/C++.

.. _pages/variants#browser_optimized_builds:

Browser optimized builds
========================

qooxdoo tries to hide browser incompatibilities from the application developer. To provide browser independent functionality it is often necessary to use different code on different browsers. Low level code like the key handler have often their own implementation for each supported browser.

The generator selects for browser optimized builds only the code which is needed for one specific browser and removes the unused code. For each supported browser engine an optimized build is generated and on load time the appropriate build is loaded. As a fall back there is always the unoptimized build.

Code like this was very common in older versions of qooxdoo:

::

    if (qx.core.Client.getInstance().isMshtml()) {
      // some Internet Explorer specific code
    } else if(qx.core.Client.getInstance().isOpera()){
      // Opera specific code
    } else {
      // common code for all other browsers
    }

Using ``Variants`` the same code looks like this:

::

    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      // some Internet Explorer specific code
    } else if(qx.core.Variant.isSet("qx.client", "opera")){
      // Opera specific code
    } else {
      // common code for all other browsers
    }

The variant ``qx.client`` is always set to the current browser, so this code works exactly like the first version. What is new is that the ``generator`` knows about variants and is able to optimize the build for one value of a variant and remove the unused code for all other values of the variant.

.. _pages/variants#config_changes:

Config changes
--------------

The browser-specific code above let's you distinguish the different browsers inside your application code. In order to serve different versions of your application for specific browsers you have to slightly change your ``config.json`` to let the generator do the magic.

::

    /* part of your "config.json" */
    "jobs" :
    {
      /* shadow the original "build-script" job and add the needed infos */
      "build-script" :
      {
        /* adding the variants */
        "variants" :
        {
          "qx.client" : [ "gecko", "mshtml", "webkit", "opera" ]
        },

        "compile-options" : 
        {
          "paths" :
          {
            /* overwrite "file" entry to get client-specific file names */
            "file" : "${BUILD_PATH}/script/${APPLICATION}-{qx.client}.js"
          }  
        }
      }
    }

The generator will generate as many versions of your application as the number of values you give in the list value of *qx.client* (4 in this example). To take advantage of these different variations of your app, you use the *{qx.client}* compile macro in the name of the output file, which will be replaced during compilation by the value currently in effect. This way you'll get output files like *myapp-gecko.js*, *myapp-mshtml.js*, ... asf.

If you specify more than one variant with multiple values, e.g.

::

    /* multiple variants with multiple values */
    "variants" :
    {
      "qx.client"   : [ "gecko", "mshtml", "webkit", "opera" ],
      "qx.debug" : ["on", "off"]
    }

a compile output is produced **for each possible combination** of all the multi-valued variants, e.g. in this case for *{qx.client: gecko, qx.debug:on}, {qx.client:gecko, qx.debug:off}, {qx.client:mshtml, qx.debug:on}, {qx.client:mshtml, ...}, ....* asf.

You would then also use multiple compile macros in the output file name, e.g. *${APPLICATION}-{qx.client}-{qx.debug}.js*, in order to distinguish those different outputs  (otherwise one compile output is copied over the other, and you are left with only the output for the last variation).

.. _pages/variants#removal_of_debugging_code:

Removal of debugging code
=========================

Often one wants to add additional checks and assertions to the code but don't want the build to suffer from these checks. This can be solved elegantly by using variants too. The variant ``qx.debug`` with the allowed values ``on`` and ``off`` can be used to add debugging code which is only active in the source version and removed from the build version.

Example:

::

    function foo(a, b) {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        if ( (arguments.length != 2) || (typeof a != "string") ) {
          throw new Error("Bad arguments!");   
      }
    }

This check is now only enabled in the source version. By default ``qx.debug`` is set to ``off`` in build versions, and ``on`` in source versions.

.. _pages/variants#using_variants:

Using variants
==============

Variants are used to select certain code paths. Each variant has a name and exactly one value from a limited list of allowed values. The variant names have a namespace prefix to avoid name conflicts. The value of a variant is immutable and once set cannot be altered in the JavaScript code.

Variants can be used in two ways. They can be used to select code using ``if`` statements or to select whole functions.

.. _pages/variants#method:_select:

Method: select()
----------------

 If the whole definition of a function should be selected the ``select`` method can be used as follows:

::

    var f = qx.core.Variant.select("qx.client", {
      "gecko": function() { ... },
      "mshtml|opera": function() { ... },
      "default": function() { ... }
    });

Depending on the value of the 
::

    "qx.client"
 
variant the corresponding function is selected. The first case is selected if the variant is "gecko", the second is selected if the variant is "mshtml" or "opera" and the third function is the default one. It is selected if none of the other keys match the variant.

.. _pages/variants#method:_isset:

Method: isSet()
---------------

This method is used to check whether a variant is set to a given value. The first parameter is the name of the variant and the second parameter is the value to check for. Several values can be "or"-combined by separating them with the "|" character. A value of "mshtml|opera" would for example check whether the variant is set to "mshtml" or "opera".

To enable the generator to optimize this selection, both parameters must be string literals.

This method is meant to be used in if statements to select code paths. If the  condition of
an if statement is only this method, the generator is able to optimize the if
statement.

Example:

::

    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      // some Internet Explorer specific code
    } else if(qx.core.Variant.isSet("qx.client", "opera")){
      // Opera specific code
    } else {
      // common code for all other browsers
    }

.. _pages/variants#framework_variants:

Framework variants
==================

The following variants are being provided by the framework:

===========================================================  ==============================================  ===================
 Variant                                                      Allowed values                                  Default value       
===========================================================  ==============================================  ===================
 ``qx.client`` Client detection                               ``gecko``, ``mshtml``, ``opera``, ``webkit``    *auto-detected*
 ``qx.debug`` Debugging code                                  ``on``, ``off``                                 ``on``              
 ``qx.aspects`` Aspect-oriented programming (AOP)             ``on``, ``off``                                 ``off``             
 ``qx.dynlocale`` Dynamic locale switch                       ``on``, ``off``                                 ``on``              
===========================================================  ==============================================  ===================

.. _pages/variants#custom_variants:

Custom variants
===============

You can easily create your own variants by using ``qx.core.Variant.define()``
