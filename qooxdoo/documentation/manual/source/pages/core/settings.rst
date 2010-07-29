
.. _pages/core/settings#defining_and_using_settings:

Settings
***************************

One of the major problems of JavaScript frameworks is that you, as the user of such a framework, cannot easily control one of the initial settings. For example the framework may have defaults which can only be changed after the framework is loaded, but not before. Most of the time this restriction is not problematic. Most applications are only interested in settings once their main routine gets processed. But there are exceptions when things must be configured at or before load time.

.. _pages/core/settings#what_are_settings:

What are settings?
==================

This is where qooxdoo's settings come in. They are directly built into the core of qooxdoo. This means that many intial settings are easily controllable using a simple hash map structure or generator settings.

For example you can control the following things in qooxdoo:

* All type of themes (colors, icons, widgets, appearance)
* Default log level and appender
* Resource-URLs of standard qooxdoo icons and widgets images
* Timeout of the image preloader
* The init component (graphical or non-graphical)
* Different debugging options for json, remote io, etc.

This list shows you some of your possibilities. 

.. _pages/core/settings#when_to_use_settings_and_when_not:

When to use settings (and when not)
====================================

Generally settings are not meant to replace the properties which exist in qooxdoo. **Settings are immutable**. There is only a default value, defined by the class which declares the setting, and a optional user value which overrides this default value. The only possiblity to change this user value is to use the generator option or to define a global map ``qxsettings`` before including the qooxdoo JavaScript file(s). It is not possible to modify the value later.

As a class developer it is quite important to not use settings for everything. The intention is to reduce the number of settings to a minimum. They are only meant to control loadtime relevant stuff. Other things should be resolved with other available technologies like properties. Properties have a much greater set of features and possibilities.

.. _pages/core/settings#defining_new_settings:

Defining new settings
=====================

New settings can be defined in this way:

::

    qx.core.Setting.define("ns.key", "value");

In contrast to :doc:`variants` there is no array of available values. Settings are not limited in this way. You can even store any JS-Type in a setting. But normally it is better to just use primitive types like Boolean, String and Number values.

The qooxdoo class definition allows you to integrate settings directly in the defining map:


::

    qx.Class.define("myapp.ClassA",
    {
      [...]

      settings : {
        "myapp.key" : value
      }
    });

The key should always contain a namespace. This protects the application developer from creating conflicting settings with the framework and maybe other qooxdoo-based libraries. The namespace could be something short. All qooxdoo settings use "qx", like the toplevel namespace. If you have a "myapp.Application" you may want to prefix all your settings with "myapp" (but deeper nested namespaces are also possible).

Even if settings (and variants) are defined in the class where they are used, they are stored in a more "global" manner and may be accessed from everywhere.

.. note::

    **Important:**
    You must be sure that the class defining --which is using a setting-- is loaded before the first access to this setting. Also you must not redefine settings.

.. _pages/core/settings#selecting_settings:

Selecting settings
==================

You can select a new value for a settings using the generator or a global map defined before loading qooxdoo.

.. _pages/core/settings#using_the_generator:

Using the generator
-------------------

Use the config.json :ref:`settings <pages/tool/generator_config_ref#settings>` config key::

    {
      ...
      "settings" : {
        "myapp.key" : "value",
        ...
      }
    }

.. _pages/core/settings#using_a_map:

Using a map
-----------

Use a map named ``qxsettings`` which is globally defined in the loading HTML page

::

    window.qxsettings = {
      "myapp.key" : value,
      ...
    }

.. note::

    Because of the namespace-like dot you must be sure to put the whole hash map key into quotes.

.. _pages/core/settings#predefined_settings:

Predefined Settings
===================

These settings are known in the qooxdoo framework:

============================== ========================================== ======================
Setting                        Recognized Values                          Default
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
============================== ========================================== ======================
