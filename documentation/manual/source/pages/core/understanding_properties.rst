.. _pages/understanding_properties#understanding_properties:

Introduction to Properties
**************************

qooxdoo comes with its own convenient and sophisticated property management system. In order to understand its power we will first take a look at the ordinary property handling in plain JavaScript first.

.. _pages/understanding_properties#ordinary_property_handling:

Ordinary Property Handling
==========================

Let's say we have a property ``width`` for an object ``obj``.

As is a good practice in regular high-level programming languages you should not access object properties directly:

::

    // NOT RECOMMENDED: direct access to properties
    obj.width = 200;  // setting a value
    var w = obj.width;  // getting the current value

Instead you should work with properties only through so-called *accessor methods* ("getters") and *mutator methods* ("setters"): 

::

    // direct access is no good practice
    obj.setWidth(200);  // setting a value
    var w = obj.getWidth();  // getting the current value

Of course, directly accessing properties may be faster because no indirection by a function call is needed. Nonetheless, in practice this does not outweight the disadvantages. Direct access to properties does not hide internal implementation details and is a less maintainable solution (Well, you don't program web applications in assembler code, do you?).

A typical implementation of the accessor and mutator methods would look like the following, where those instance methods are declared in the ``members`` section of the class definition:

::

    // ordinary example #1
    members:
    {
      getWidth : function() {
        return this._width;
      },

      setWidth : function(width)
      {
        this._width = width;
        return width;
      }
    }

Something that is very familiar to the typical programmer of Java or any other comparable language. Still, it is not very convenient. Even this trivial implementation of only the basic feature requires a lot of keystrokes. More advanced features like type checks, performance optimizations, firing events for value changes, etc. need to be coded by hand. An improved version of the setter could read:

::

    // ordinary example #2
    members:
    {
      setWidth : function(width)
      {
        if (typeof width != "number") {
          // Type check: Make sure it is a valid number
          throw new Error("Invalid value: Need a valid integer value: " + width);
        };

        if (this._width != width)
        {
          // Optimization: Only set value, if different from the existing value
          this._width = width;

          // User code that should be run for the new value
          this.setStyleProperty("width", width+ "px");
        };

        return width;
      }
    }

Large part of the code found here is for managing the validation and storage of the incoming data. The property-specific user code is rather short. 

.. _pages/understanding_properties#qooxdoo_property_handling:

qooxdoo Property Handling
=========================

Let's see how the above example can be written using qooxdoo's property implementation. The property itself is declared in the ``properties`` section of the class definition. Only if some property-specific code needs to be run in the setter, an additional ``apply`` method has to be given:

::

    // qooxdoo version of ordinary example #2
    properties : {
      width : { check : "Number", apply : "applyWidth" }
    }

    members : 
    {
      applyWidth : function(value) {
        this.setStyleProperty("width", value + "px");
      }
    }

Compare that to the lengthy code of the ordinary code example above! Much shorter and nicer, also by objective means. And it almost only contains the "real code". 

The apply method may optionally be defined for each property you add to your class. As soon as you define a key "apply" in your property declaration map the method  gets automatically called on each property modification (but not during initial initialization). If you do not define an apply method, the property just handles the fundamental storage of your data and its disposal.

Despite needing much less explicit code (keep in mind, for *every* property), it actually contains at least as many features as the hand-tuned code: The type of the property is checked automatically (``Number`` in the example above). Moreover, new values are only stored (and the optional apply method called) if different from the existing values. A tiny but important optimization.

.. _pages/understanding_properties#change_events:

Change Events
-------------

qooxdoo supports full-featured event-based programming throughout the framework. So-called *change events* are a good example for this powerful concept. 

Each property may optionally behave as an observable. This means it can send out an event at any time the property value changes. Such a change event (an instance of ``qx.event.type.Data``) is declared by providing a custom name in the ``event`` key of the property definition. While you are free to choose any event name you like, the qooxdoo framework tries to consistently use the naming convention ``"change + Propertyname"``, e.g. ``"changeWidth"`` for a change of property ``width``. In order to get notified of any value changes, you simply attach an event listener to the object instance containing the property in question.

For example, if you would like the ``element`` property of a Widget instance ``widget`` to fire an event named ``"changeElement"`` any time the value changes. 

::

    properties : {
      element: { event: "changeElement" }
    }

If this happens, you would like to set the DOM element's content:

::

    widget.addEventListener("changeElement", function(e) {
      e.getValue().innerHTML = "Hello World";
    });

The anonymous function acts as an event handler that receives the event object as variable ``e``. Calling the predefined method ``getValue()`` returns the new value of property ``element``.

.. _pages/understanding_properties#available_methods:

Available Methods
=================

qooxdoo's dynamic properties not only make sure that all properties behave in a consistent way, but also guarantee that the API to access and manipulate properties are identical.
The user is only confronted with a single interface, where the method names are easy to understand. 
Each property creates (at least) the following set of methods:

* ``setPropertyName()``: Mutator method ("setter") to set a new property value.
* ``getPropertyName()``: Accessor method ("getter") that returns  the current value.

Additionally, all properties of boolean type (declared by ``check: "Boolean"``) provide the following convenience methods:

* ``isPropertyName()``: Identical to ``getPropertyName()``.
* ``togglePropertyName()``: Toggles between true and false.

.. _pages/understanding_properties#property_groups:

Property Groups
===============

Property groups is a layer above the property system explained in the last paragraphs. They make it possible to set multiple values in one step using one ``set`` call. ``qx.ui.core.Widget`` supports the property group ``padding``. ``padding`` simply sets the ``paddingLeft``, ``paddingRight``, ``paddingTop`` and ``paddingBottom`` property.

::

    widget.setPadding(10, 20, 30, 40);

The result is identical to:

::

    widget.setPaddingTop(10);
    widget.setPaddingRight(20);
    widget.setPaddingBottom(30);
    widget.setPaddingLeft(40);

As you can see the property groups are a nice really convenient feature. 

.. _pages/understanding_properties#shorthand_support:

Shorthand support
-----------------

One more thing. The property group handling also supports some CSS like magic like the shorthand mode for example. This means that you can define only some edges in one call and the others get filled automatically:

::

    // four arguments
    widget.setPadding(top, right, bottom, left);

    // three arguments
    widget.setPadding(top, right+left, bottom);

    // two arguments
    widget.setPadding(top+bottom, right+left);

    // one argument
    widget.setPadding(top+right+bottom+left);

As you can see this can also reduce the code base and make it more userfriendly.

BTW: The values of a property group can also be given an array as first argument e.g. these two lines work identically:

::

    // arguments list
    widget.setPadding(10, 20, 30, 40);

    // first argument as array
    widget.setPadding([10, 20, 30, 40]);

.. note::

    For more information regarding declaration, usage and internal functionality please see the  :doc:`the developer documentation <defining_properties>`.

