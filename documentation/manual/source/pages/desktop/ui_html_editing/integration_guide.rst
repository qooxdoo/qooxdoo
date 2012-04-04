.. _pages/ui_html_editing/integration_guide#integrate_the_htmlarea_into_your_application:

Integrate the HtmlArea into your application
********************************************

.. note::

  This explanations mainly do address the ``0.8+ based`` HtmlArea component.

This page does explain what you should consider when integrating the HtmlArea component in your application. However, it does **not** explain how to setup the component itself, it's rather an integration guide to avoid pitfalls. 

.. _pages/ui_html_editing/integration_guide#use_public_api:

Use Public API
==============

This one should be self-explaining. Do not use any internal API to get things done even it's the easy way to go. If it's hidden from the application developer then by purpose, but if you need access to specific parts of the component which is not offered don't hesitate to file a bug report.

.. _pages/ui_html_editing/integration_guide#use_events:

Use Events
==========

The component does offer various events to work with e.g. the ``ready`` event to get informed of the finished loading. 

The bottom line is the same as for the public API: use these events to interact with the component. If an event is missing feel free to file a bug report.

.. _pages/ui_html_editing/integration_guide#lazy_initialization:

Lazy Initialization
===================

The HtmlArea widget is using a low-level editing component to offer a WYSIWYG editor solution. The widget does initialize this editing component after the first appear of the widget. So if you use e.g. a stack container which hides the HtmlArea keep in mind that the widget is only fully usable after it is shown.

.. _pages/ui_html_editing/integration_guide#toolbar_details:

Toolbar Details
===============

The HtmlArea does only offer the plain editing widget so if you do not use the `HtmlEditor <http://qooxdoo.org/contrib/project#htmleditor>`_ contribution and instead create your own toolbar you have to consider some specialities concerning the focus management of qooxdoo.

Since the HtmlArea relies on that the focus is not lost to another widget (e.g. a toolbar button) during the execution of a command you have to set two focus-specific properties on each widget which runs commands at the HtmlArea component.

The two properties ``keepFocus`` and ``focusable`` have to be used together to get the correct behaviour. The more important property is ``keepFocus`` which certainly ensures that the given widget ``never`` get the focus - even if this widget is clicked. This will leave the focus at the HtmlArea component solving many focus-related issues successfully (especially for IE browsers).

Example code snippet

::

  button = new qx.ui.toolbar.Button(null, iconURL);
  button.set({ focusable : false, keepFocus : true });

.. _pages/ui_html_editing/integration_guide#no_own_focus_management:

No Own Focus Management
=======================

As already mentioned the focus management is important for HTML editing widgets and there are special solutions necessary for the component already. Implementing an own focus management on top in your application code ``can`` cause problems for your users. So if you encounter any issues that the component e.g. does not perform a certain command even a button is clicked it's probably a focus-related issue.
As always: the component is far from perfect, don't hesitate to file a bug report for issues you encounter.

.. _pages/ui_html_editing/integration_guide#keyboard_shortcuts:

Keyboard Shortcuts
==================

Since you can use :doc:`keyboard shortcuts <available_shortcuts>` to manipulate the content you should not implement shortcuts with the same key bindings. 
A possibility to disable the shortcuts completely will soon be available. See `Bug #1193 <http://bugzilla.qooxdoo.org/show_bug.cgi?id=1193>`_ for details.