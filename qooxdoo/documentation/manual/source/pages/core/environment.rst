Envrionment
***********

Introduction
============

The environment of an application is a set of values that can be queried through a well-defined interface. Values are referenced through unique keys. You can think of this set as a global key:value store for the application. Values were write-once, read-many. A value for a certain key can be set in various ways, e.g. by code, through build configuration, etc., usually during startup of the application, and not changed later. Other environment values are automatically discovered when they are queried at run time, such as the name of the current browser, or the number of allowed server connections. This way, the environment API also implements the browser feature detection.

Environment settings are also used in the framework, among other things to add debug code for additional tests and logging, to provide browser-specific implementations of certain methods, asf. Certain environment keys are pre-defined by qooxdoo, the values of which can be overridden by the application. Applications are also free to define their own environment keys and query their values at run time.


.. _pages/core/environment#motivation:

Motivation
==========

Environment settings address various needs around JavaScript applications:

* Control initial settings of the framework, before the custom classes are loaded.
* Pass values from outside to the application.
* Trigger the creation of multiple build files.
* Query features of the platform at run time (browser engine, HTML5 support, etc.)
* Create builds optimized for a specific target environment.
* Create feature-based builds.


.. _pages/core/environment#defining:

Defining New Environment Settings
=================================

An environment setting, a key:value pair, can be defined in multiple ways:

* in application code
* in the class map
* in the generator configuration
* in JavaScript code in the index.html
* via URL parameter

Those possibilities are explained in the following sections.


.. _pages/core/environment#in_application_code:

In Application Code
-------------------

::

  qx.core.Environment.add("key", "value");


.. _pages/core/environment#in_class_map:

In the Class Map
----------------

::

  qx.Class.define("myapp.ClassA", 
  {
    [...]

    environment : {
      "myapp.key" : value
    }
  });


.. _pages/core/environment#in_configuration:

In the Generator Config
-----------------------

::

  "myjob" : 
  {
    [...]

    "environment" : {
      "myapp.key" : value
    }
  }

Specifying a list of values for a key triggers the creation of multiple output files by the generator. 

::

  "myjob" : 
  {
    [...]

    "environment" : {
      "myapp.key" : [value1, value2]
    }
  }


The generator will create two output filesSee the :ref:`environment <pages/tool/generator_config_ref#environment` key.


.. _pages/core/environment#in_index_html:

In the Loading index.html
-------------------------

::

  <script>
    window.qxenv =
    {
      "myapp.key" : value
    }
  </script>


.. _pages/core/environment#querying:

Querying Environment Settings
=============================


::

  qx.core.Environment.get("myapp.key");


::

  qx.core.Environment.select("myapp.key", {
    "value1" : value,
    "value2" : value
  }


Removal of Code
---------------

Usually, function calls like *qx.core.Environment.get()* are executed at run time and return the given value of the environment key. This is useful if such value is determined only at run time, or can change between runs. But if you want to pre-determine the value, you can set it in the generator config. The generator can then anticipate the outcome of a query and remove code that wouldn't be used at run time.

For example,

::

    function foo(a, b) {
      if (qx.core.Variant.get("qx.debug") == true) {
        if ( (arguments.length != 2) || (typeof a != "string") ) {
          throw new Error("Bad arguments!");   
        }
      }
      return 3;
    }

will be reduced in the case *qx.debug* is *false* to 

::

    function foo(a, b) {
      return 3;
    }


In the case of a *select* call,

::

  qx.core.Environment.select("myapp.key", {
    "value1" : resvalue1,
    "value2" : resvalue2
  }

will reduce if *myapp.key* has the value *value2* to

::

    resvalue2






.. _pages/core/environment#pre_defined:

Pre-defined Environment Keys
============================

TODO: Review key list

TODO: Review possible values and defaults

============================== ========================================== ======================
Key                            Possible Values                            Default
============================== ========================================== ======================
qx.allowUrlSettings            true/false                                 false
qx.allowUrlVariants            true/false                                 false
qx.application                 <string>                                   <undefined>
qx.bom.htmlarea.HtmlArea.debug "on"/"off"                                 "off"
qx.disposerDebugLevel          0, 1, ...                                  0
qx.globalErrorHandling         "on"/"off"                                 "on"
qx.ioRemoteDebug               true/false                                 false
qx.ioRemoteDebugData           true/false                                 false
qx.jsonEncodeUndefined         true/false                                 true
qx.jsonDebugging               true/false                                 false
qx.nativeScrollBars            true/false                                 false
qx.propertyDebugLevel          0, 1, ...                                  0
qx.tableResizeDebug            true/false                                 false
qx.aspects                     [ "on", "off" ]                            "off"
qx.client                      [ "gecko", "mshtml", "opera", "webkit" ]   qx.bom.client.Engine.NAME
qx.debug                       [ "on", "off" ]                            "on"
qx.dynlocale                   [ "on", "off" ]                            "off"
check.name
engine.version
engine.name
browser.name
browser.version
browser.documentmode
browser.quirksmode
device.name
locale
locale.variant
os.name
os.version
plugin.gears
plugin.quicktime
plugin.quicktime.version
plugin.windowsmedia
plugin.windowsmedia.version
plugin.divx
plugin.divx.version
plugin.silverlight
plugin.silverlight.version
plugin.flash
plugin.flash.version
plugin.flash.express
plugin.flash.strictsecurity
io.maxrequests
io.ssl
io.xhr
event.touch
event.pointer
ecmascript.objectcount
html.webworker
html.geolocation
html.audio
html.video
html.video.ogg
html.video.h264
html.video.webm
html.storage.local
html.storage.session
html.classlist
html.xpath
html.xul
html.canvas
html.svg
html.vml
html.dataurl
css.textoverflow
css.placeholder
css.borderradius
css.boxshadow
css.gradients
css.boxmodel
css.translate3d
phonegap
phonegap.notification
============================== ========================================== ======================

