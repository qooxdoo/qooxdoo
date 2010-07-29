
.. _pages/core/variants#variants:

Variants
********

Variants enable the selection and removal (in the build version) of code.
A variant is a named value from a finite collection from which exactly one is set
at load time of the framework. The static class ``qx.core.Setting`` can be used to query the value of a setting.

Depending on the current value of a variant a specific code path can be chosen using the ``qx.core.Setting.select`` method.

You can set variants in the generator configuration. The generator will then set this variant and for the build version will remove all code paths which are not selected by the current variant value.

Variants are used to implement browser optimized builds and to remove debugging code from the build version.  It is very similar to conditional compilation in C/C++. In the source version of the application, calls to ``select`` are like if/case switches.

.. _pages/core/variants#browser_optimized_builds:

Browser optimized builds
========================

qooxdoo tries to hide browser incompatibilities from the application developer. But to provide browser independent functionality it is sometimes necessary to use different code on different browsers. Low level code like the key handler often has an individual implementation for each supported browser (and uses browser variants to achieve this).

The generator selects for browser optimized builds only the code which is needed for one specific browser and removes the unused code. For each supported browser engine an optimized build is generated and on load time the appropriate build is loaded. As a fall back there can be an unoptimized build.

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

The variant ``qx.client`` is always set to the current browser, so this code works exactly like the first version. What is new is that the generator knows about variants and is able to optimize the build for one value of a variant and remove the unused code for all other values of the variant.

Browser optimization is enabled by default in skeleton based applications. 

.. _pages/core/variants#removal_of_debugging_code:

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

This check is now only enabled in the source version. By default ``qx.debug`` is set to ``off`` in build versions.

.. _pages/core/variants#details:

Details
=======

Variants are used to select certain code paths. Each variant has a name and exactly one value from a limited list of allowed values. The variant names have a namespace prefix to avoid name conflicts. The value of a variant is immutable and once set cannot be altered in the JavaScript code.

.. _pages/core/variants#definition_of_a_variant:

Definition of a Variant
-----------------------

The method ``qx.core.Variant.define`` is used to define a variant. This is how ``qx.debug`` is defined:

::

    qx.core.Variant.define("qx.debug", [ "on", "off" ], "on");

The first parameter is the name of the variant, the second is a string array of all allowed values and the third the default value. The default is taken if the variant is not set otherwise.

.. _pages/core/variants#using_variants:

Using Variants
--------------

Variants can be used in two ways. They can be used to select code using ``if`` statements or to select whole functions.

.. _pages/core/variants#select:

select
^^^^^^

If the whole definition of a function should be selected the ``select`` method can be used as follows:

::

    var f = qx.core.Variant.select("qx.client", {
      "gecko": function() { ... },
      "mshtml|opera": function() { ... },
      "default": function() { ... }
    });

Depending on the value of the ``qx.client`` variant the corresponding function is selected. The first case is selected if the variant is *gecko*, the second is selected if the variant is *mshtml* or *opera* and the third function is the default case. It is selected if none of the other keys match the variant.

.. _pages/core/variants#isset:

isSet
^^^^^

This method is used to check whether a variant is set to a given value. The first parameter is the name of the variant and the second parameter is the value to check for. Several values can be "or"-combined by separating them with the "|" character. A value of *mshtml|opera* would for example check whether the variant is set to "mshtml" or "opera".

To enable the generator to optimize this selection, both parameters must be string literals.

This method is meant to be used in *if* statements to select code paths. If the  condition of
an *if* statement is only this method, the generator is able to optimize the statement.

Example::

    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      // some Internet Explorer specific code
    } else if(qx.core.Variant.isSet("qx.client", "opera")){
      // Opera specific code
    } else {
      // common code for all other browsers
    }

.. _pages/core/variants#setting_the_value_of_a_variant:

Setting the Value of a Variant
------------------------------

There are three ways to set a variant:

* Setting the value in the global variable ``qxvariants`` before qooxdoo is loaded.
* Set the variant in the generator configuration, using the ``variants`` config key.
* Set the variant in JS class code, using ``qx.core.Variant.define``.

For the first approach just define a global map named ``qxvariants``. This is how ``qx.debug`` can be set to ``off`` using in the loader HTML file of a qooxdoo application:

.. code-block:: html

    <script language="JavaScript" type="text/javascript">
    qxvariants = {
        "qx.debug": "off"
    }
    </script>     
    <script language="JavaScript" type="text/javascript" src="script/qooxdoo_application.js"></script>


.. _pages/core/variants#predefined_variants:

Predefined Variants
===================

Here is a list of variants currently predefined in qooxdoo:

============================  =========================================  =========================
 Variant                       Possible Values                            Default
============================  =========================================  =========================
"qx.aspects"                  [ "on", "off" ]                            "off"
"qx.client"                   [ "gecko", "mshtml", "opera", "webkit" ]   qx.bom.client.Engine.NAME
"qx.debug"                    [ "on", "off" ]                            "on"
"qx.dynlocale"                [ "on", "off" ]                            "off"
============================  =========================================  =========================


