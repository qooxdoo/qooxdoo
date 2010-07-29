.. _pages/gui_toolkit/ui_develop#custom_widgets:

Custom Widgets
**************

Most widgets are built using a combination of already existing, more basic widgets. This is also true for custom widgets made for a specific application or as an extension to the existing feature set of qooxdoo.

.. _pages/gui_toolkit/ui_develop#inheritance_structure:

Inheritance Structure
=====================

A more complex widget normally extends the base class ``qx.ui.core.Widget``. A widget can manage children using a set of protected methods. Extending from a richer widget often has the side effect that the final class do contain APIs which do not make sense in the derived class anymore. Also be sure to not extend from the ``Composite`` or a widget based on this class. This is mainly because it has public methods for the whole otherwise internal layout and children handling and would propagate all the internal information to the outside when children are added, or the layout is modified by the derived class.

A good example: Most rich text editors implemented in JavaScript make use of a iframe. One could imagine to use the ``Iframe`` class as a base to build such a component. The problem is that most of the methods and properties like ``setSource`` or ``reload`` do not make a lot of sense on a editor component. It's better to embed the needed widgets into the outer widget to hide its functionality in the custom class.

The qooxdoo ``Spinner`` for example extends the ``Widget`` as well and adds a ``TextField`` and two ``RepeatButton`` instances. The layout is done by a Grid layout. All the children and the choosen layout are hidden from the outside. There are no public accessors for the layout or the children. This makes sense as no one is interested in the children of a ``Spinner`` widget. These methods would also mean a lot of bloat added to the API of such an widget.

.. _pages/gui_toolkit/ui_develop#setup_content:

Setup Content
=============

The following methods may be used to manage children: 

* ``_getChildren``
* ``_add``, ``_addAt``, ``_addBefore``, ``_addAfter``
* ``_remove``, ``_removeAt``, ``_removeAll``

It is possible to use any layout available. To setup the layout just use ``_setLayout`` and to read it out afterwards use ``_getLayout``.

For details refer at the API documentation of `qx.ui.core.Widget <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.core.Widget>`_.

.. _pages/gui_toolkit/ui_develop#child_controls:

Child Controls
==============

qooxdoo supports a mechanism called child controls. A child control is a widget as part of another widget. Child controls were introduced to have a common way of accessing these controls and make it easy to refine them when a class should be extended. Each child control is accessible using an identifier which is basically a string. By convention these strings are all lower-case und use dashes to structure complex identifiers. Typical identifiers are ``button``, ``icon`` or ``arrow-up``. Do never use a slash ``/`` as this might conflict with the appearance system.

Instances for the supported child controls are created dynamically as needed. A widget developer just need to override the method ``_createChildControlImpl``, let the method work on the customized controls, and just calls the super class method when the incoming ID is not supported. For example such a method might look like:

::

  _createChildControlImpl : function(id)
  {
    var control;

    switch(id)
    {
      case "icon":
        control = new qx.ui.basic.Image;
        this._add(control);
        break;
    }  

    return control || this.base(arguments, id);
  }

Each child control should directly be adding itself to the parent. As mentioned before child controls are automatically created as needed. This basically means that if nobody asks for a specific child control it is never created or added. This is an important feature for dynamic widgets like as this reduces the initial memory and CPU usage. A child control is always executed when some code asks for the control. This can happen through different methods:

* ``getChildControl(id, notcreate)``: Returns the child control with the given ID. May return ``null`` when the second argument is ``true``. This is basically used to check if child control is already created and apply something to it. In some complexer scenarios this makes sense, but can be ignored for a moment.
* ``_showChildControl(id)``: Executes ``show()`` on the child control. This method also creates the control when not happend yet. It also returns the control to apply other properties to it.
* ``_excludeChildControl(id)``: Excludes the widget using ``exclude()``. When the control is not yet created the function do nothing. The method has no return value.
* ``_isChildControlVisible(id)``: Returns ``true`` when the child control with the given ID is created and visible.
* ``hasChildControl(id)``: Returns ``true`` when the child control with the given ID is created.

.. _pages/gui_toolkit/ui_develop#styling:

Styling
=======

Child controls are automatically supported by the appearance system. For every child control a selector is generated which starts with the first widget which is not a child control itself. Typical selectors look like:

* ``spinner/up-button``
* ``groupbox/legend``
* ``tree-item/icon``

As a container for child controls may be a child control for another container as well there are even more complex selectors possible:

* ``list/scrollbar-x/slider``
* ``splitbutton/button/icon``

This means that even the deepest child control can be easily accessed for theme authors. As a author of a widget all styling of a widget should be defined in the appearance theme and not in the widget itself. The widget and the ``_createChildControlImpl`` method should only apply functional properties like ``zIndex`` or ``tabIndex``, but no decorations, colors or fonts for example.

As mentioned a key always starts with the appearance of the first widget which is not itself a child control. Appearance values of the inner widgets are ignored as long as they are used as a child control. Instead the ID of the child control is used. The ``/`` is used for separating the child controls. All widgets added through user code start with an own appearance. For example the items of the ``List`` widget have the appearance ``list-item``. Their appearance key is also ``list-item`` and not ``list/item``.

For details about styling please refer to :doc:`the theming article <ui_theming>`.

.. _pages/gui_toolkit/ui_develop#html_elements:

HTML Elements
=============

A normal qooxdoo widget consists of at least two HTML Elements (`API <http://api.qooxdoo.org/#qx.html.Element>`_). The first one is the container element which is the outer frame of each widget. The inner one is the content element which is the target for children added to the widget. The content element is also used for the iframe of the ``Iframe`` widget and the image of the ``Image`` widget. This means it may contain children or may be used by a native DOM element which do not allow any children.

There might be some other elements depending on the configuration:

* shadow: Placed into the container with negative offsets to be visible behind the original widget.
* decorator: Placed into the container with the same size as the container. Used to render all kind of decorators. 
* protector: Helper to fix some kind of hover issues when changing decorators during event sequences e.g. hover effects.

For a author of a widget the content element is normally the most important one followed by the container element. The other elements are quite uninteresting. It is good to know that they are there, but one typically have less to do with them.

Both elements are instances of ``qx.html.Element`` and this way come with a cross-browser fixed API to apply styles and attributes to the DOM nodes. All of these things can be done without the need that the DOM element is created or inserted. For details on ``qx.html.Element`` please have a look at :doc:`the technical documentation </pages/low_level/html_element_handling>`.

The elements are accessible through the function ``getContentElement()`` respectively ``getContainerElement()``. The elements are stored privately in each widget instance and are only accessible through the methods in derived classes.

.. _pages/gui_toolkit/ui_develop#custom_elements:

Custom Elements
===============

qooxdoo normally generates a bunch of styled ``div`` elements. Some widgets like iframes or images needs other elements though. Normally the only element which is replaced is the content element. To do this the method ``_createContentElement`` needs to be overwritten. The overwritten method should create a instance of ``qx.html.Element`` (or a derived class), configure it with some static attributes or styles, and finally return it. For most natively supported types there exist a class which can be used already. In special cases the widget author also needs to write a special low-level class which is derived from ``qx.html.Element``.

.. _pages/gui_toolkit/ui_develop#working_with_events:

Working with Events
===================

Events could be added to the html elements as well as to the child controls. The names of the methods assigned should follow the following names for convention. 

* For the HTML elements use: ``_onContentXXX`` or ``_onContainerXXX``
* For the child controls use: ``_onIconXXX`` or ``_onFieldXXX`` etc.

Where ``XXX`` stands for the name of the event or of the change that happens. This will result in names like ``_onIframeLoad`` or ``_onContentInput``.

.. _pages/gui_toolkit/ui_develop#anonymous_widgets:

Anonymous Widgets
=================

Anonymous widgets are ignored in the event hierarchy. This is useful for combined widgets where the internal structure do not have a custom appearance with a different styling from the element around. This is especially true for widgets like checkboxes or buttons where the text or icon are handled synchronously for state changes to the outer widget.

A good example is the ``SelectBox`` widget where the ``mouseover`` event should only affect the whole widget itself not the several child controls of which this widget is composited. So setting the child controls (in this case an ``atom`` and an ``image`` widget) to ``anonymous`` keeps these child control widgets from receiving any event and the event handling is done completely by the parent widget (the ``SelectBox`` itself).