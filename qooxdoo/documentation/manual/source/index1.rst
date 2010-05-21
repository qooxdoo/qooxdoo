Manual 1.2
**********

<note>This is preliminary documentation for an unreleased qooxdoo version. You might be interested in consulting the documentation of :doc:`released versions <:documentation>`.</note> 

::

    qx.Class.define("qx.MyClass", {
      construct: function() {
        this.initMyProperty([1, 2, 4, 8]);
      },
      properties : {
        myProperty : { deferredInit : true}
      }
    };

|image0| Windows
^^^^^^^^^^^^^^^^

.. |image0| image:: http://qooxdoo.org/_media/documentation/windows.png?w=22&h=22&cache=cache

|pages/layout/flow.png|

.. |pages/layout/flow.png| image:: /pages/layout/flow.png

Getting Started
===============

  * :doc:`pages/requirements`
  * :doc:`pages/helloworld` - ***"A must-read introduction"***

Tutorial
========

  * :doc:`pages/tutorial-part-1`
  * :doc:`pages/tutorial-part-2`
  * :doc:`pages/tutorial-part-3`
  * :doc:`pages/tutorial-part-4-1`

SDK
===

  * :doc:`pages/introduction_sdk`
  * :doc:`pages/framework_structure`
  * :doc:`pages/application_structure`
  * :doc:`pages/code_structure`
  * :doc:`pages/architecture`

GUI Toolkit
===========

Documents
---------

  * :doc:`pages/ui_overview` Definition of widgets, roots, applications, ...
  * :doc:`pages/ui_layouting` Layout managers, panes, visibility, ...
  * :doc:`pages/ui_widgets` Existing widget overview, ...
  * :doc:`pages/ui_interaction` Mouse, keyboard, focus, ...
  * :doc:`pages/ui_resources` Using images and other non-class files, ...
  * :doc:`pages/ui_selection` Selecting widgets and working with ranges
  * :doc:`pages/ui_dragdrop` Powerful Drag&Drop with built-in data handling support
  * :doc:`pages/ui_inline` Using widgets inline in HTML-dominated web pages
  * :doc:`pages/ui_theming` High-level overview of theming capabilities
  * :doc:`pages/ui_appearance` Detailed explanation to work with appearances
  * :doc:`pages/ui_custom_themes` Write custom themes
  * :doc:`pages/ui_decorators` Working with decorators, defining new ones, writing custom ones, ...
  * :doc:`pages/ui_develop` Developing custom widgets, understanding child controls, HTML elements, ...
  * :doc:`pages/ui_form_handling` Creating complex forms using classes like Button, TextField, List, ...
  * :doc:`pages/ui_menu_handling` Creating simple and complex menus
  * :doc:`pages/ui_using_themes_of_contribs` Using themes of contributions in your application
  * :doc:`pages/ui_html_editing` Overview of HTML editing capabilities

References
----------

  * :doc:`pages/widget`
  * :doc:`pages/layout`

Core Framework
==============

Object Orientation
------------------

  * :doc:`pages/oo_introduction`
  * :doc:`pages/oo_feature_summary`

  * :doc:`pages/classes`  ( :doc:`Quick Ref <pages/class_quickref>` )
  * :doc:`pages/interfaces`  ( :doc:`Quick Ref <pages/interface_quickref>` )
  * :doc:`pages/mixins`  ( :doc:`Quick Ref <pages/mixin_quickref>` )

Properties
----------

  * :doc:`pages/understanding_properties`
  * :doc:`pages/property_features`
  * :doc:`pages/defining_properties`
  * :doc:`Quick Ref <pages/properties_quickref>`

References
----------

  * :doc:`Array Reference <pages/array>`

Low Level Framework
===================

  * :doc:`Overview <lowleveloverview>`
  * :doc:`Scenarios <lowlevelscenarios>`

Tutorials
---------

  * :doc:`pages/setup_a_low-level_library`
  * :doc:`pages/low_level_apis` (Query and modify styles, attributes, ...)
  * :doc:`pages/back-button_and_bookmark_support`

Tech Documents
--------------

  * :doc:`pages/html_element_handling`
  * :doc:`pages/image_handling`
  * :doc:`pages/event_layer_impl`
  * :doc:`pages/focus_layer_impl`
  * :doc:`pages/qooxdoo_animation`

Communication
=============

There are two forms of client-server communication supported:

  * :doc:`Low-level AJAX calls <pages/remote_io>`
  * Higher-level Remote Procedure Calls (RPC)
    * :doc:`pages/rpc`
    * RPC Servers: :doc:`Java <pages/rpc_java>`, :doc:`PHP <pages/rpc_php>`, :doc:`Perl <pages/rpc_perl>`,  :doc:`Python <pages/rpc_python>`
    * :doc:`pages/rpc_server_writer_guide` 

Development
===========

Debugging
---------

  * :doc:`pages/logging`
  * :doc:`pages/debugging`
  * :doc:`pages/unit_testing`

Performance
-----------

  * :doc:`pages/memory_management`
  * :doc:`pages/profiling`

Other
-----
  * :doc:`pages/snippets`
  * :doc:`pages/enterprise_application_development`
  * :doc:`pages/antipatterns`

  * :doc:`pages/variants`
  * :doc:`Internationalization, Localization <pages/internationalization>`
  * :doc:`pages/image_clipping_and_combining`

  * :doc:`pages/remote_table_model`
  * :doc:`pages/data_binding`

  * :doc:`pages/write_api_documentation`
  * :doc:`pages/reporting_bugs`

  * :doc:`pages/development_platforms`
  * :doc:`pages/development_tools`

  * :doc:`pages/aspects_template`

  * :doc:`pages/internet_explorer_specific_settings`

Tooling
=======

General
-------

  * :doc:`pages/tool/generator`
  * :doc:`pages/tool/generator_usage`
  * :doc:`pages/tool/generator_default_jobs`
  * :doc:`Generator Configuration Overview <pages/tool/generator_config>`
  * |Generator Cheat Sheet (PDF)|

.. |Generator Cheat Sheet (PDF)| image:: /pages/tool/generator_cheat_sheet_1.0.0-1.pdf

  * :doc:`Snippets (Tool-related) <pages/snippets#Tooling>`
  * :doc:`pages/tool/source_code_validation`

Generator Configuration
-----------------------

  * :doc:`Configuration Key Reference <pages/tool/generator_config_ref>`
  * :doc:`Configuration Macro Reference <pages/tool/generator_config_macros>`
  * :doc:`Configuration Detail Articles <pages/tool/generator_config_articles>`

Specific Topics
---------------

Parts
^^^^^

  * :doc:`Overview <pages/parts_overview>`
  * :doc:`Using Parts <pages/parts_using>`
  * Reference:
    * :doc:`Generator Configuration <pages/tool/generator_config_ref#packages >`
    * `qooxdoo API <http://demo.qooxdoo.org/1.2.x/apiviewer/index.html#qx.io.PartLoader >`_

Code Compilation
^^^^^^^^^^^^^^^^

  * :doc:`ASTlets <pages/tool/astlets>` - AST fragments as they are generated

Migration
=========

  * :doc:`pages/migration_guide`


