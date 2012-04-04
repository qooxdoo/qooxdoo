.. _pages/ui_html_editing/technicalfeaturelist#technical_feature_list:

Technical Feature List
**********************

In comparison to the :doc:`featurelist` of the HtmlArea this page describes some technical insights of the component. If you plan to get to know some details of how to develop a WYSIWYG component and want to learn the pitfalls of the different browser implementations this is good place to start.

.. _pages/ui_html_editing/technicalfeaturelist#startup:

Startup
=======

The HtmlArea relies on a editable iframe. To take control over this iframe the component has to ensure that the iframe's document is fully loaded and accessible. For every browser the ``load`` event of the iframe object is used. Only for IE it is necessary to poll the document if it's not immediately available after the ``load`` event. The result of the startup phase is the ``ready`` event which informs the application developer that the startup was successful.

.. _pages/ui_html_editing/technicalfeaturelist#content_wrapping:

Content Wrapping
================

Since the application developer only sets the content of the HtmlArea and not the whole document the component needs to setup the rest of the content (``DOCTYPE``, ``HTML`` and ``BODY`` elements).
The difficult exercise here is to set the right style attribute at the right element for each browser. 

The toughest thing is to get the right behaviour for native scrollbars. In IE for example the overflow handling with ``overflow-x`` and ``overflow-y`` does not work correctly. When both style attributes are set IE does mix them up by overwriting one with the others value.

Anyway, the correct content wrap is important for 

* document is taking the whole space of the iframe
* no margins and paddings are set
* scrollbars are only shown if the user enters more content than space is available

.. _pages/ui_html_editing/technicalfeaturelist#editable_document:

Editable Document
=================

Another pitfall is how to set the document of the iframe object editable. There are two properties which can be be applied for an editable document: **designMode** and **editable**. 

The ``designMode`` property is applied for all browsers and works at the ``document`` node of the iframe. 

Setting the ``editable`` property is only needed for gecko browsers. And only if the HtmlArea was hidden and shown again. The ``editable`` property is applied to the ``body`` element.

.. _pages/ui_html_editing/technicalfeaturelist#internet_explorer:

Internet Explorer
-----------------

For IE it is important to set the document design mode **before** the content is rendered. Once the document is editable it does not loose this status even if the whole component is hidden and shown again.

.. _pages/ui_html_editing/technicalfeaturelist#gecko,_webkit_and_opera:

Gecko, Webkit and Opera
-----------------------

All three need to have rendered content to set the document design mode correctly. 

.. _pages/ui_html_editing/technicalfeaturelist#focus_management:

Focus Management
================

At least IE has problems whenever a native command (*execCommand* method) does manipulate the content of the editable iframe and the iframe document does **not** have the focus. If an application developer want to use a toolbar to offer the user an interface to manipulate the content he has to make sure that each of these buttons need a special setup. Otherwise the button would *steal* the focus from the editing component whenever clicked. 

Luckily qooxdoo does offer this customization out-of-the-box. The application developer only has to set the properties *keepFocus* to *true* and *focusable* to *false*.

::

  button.set({
    focusable: false,
    keepFocus: true
  });

.. _pages/ui_html_editing/technicalfeaturelist#advanced_key_events:

Advanced Key Events
===================

One major feature is to track the user input. To use the powerful key event handler in qooxdoo the HtmlArea does listen to all key events at the ``body`` element and handles various actions depending on the user's input.
This way it is possible to work with a ``keyIdentifier`` instead of the ``keyCode`` or ``charCode``.