.. _pages/qooxdoo_animation#qooxdoo_animation:

.. index:: animation

qooxdoo Animation
*****************

qooxdoo Animation is a low level animation layer which comes with several effects to animate DOM elements. An effect changes one or more attributes of a DOM element from a start to an end value in the given time either linear or using a transition function. Effects can be stacked in a queue and orderd by assigning a startup delay.

* `API documentation <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.fx>`_
* `Demos <http://demo.qooxdoo.org/%{version}/demobrowser/#animation~Login.html>`_
* `Issues <http://bugzilla.qooxdoo.org/buglist.cgi?query_format=advanced&short_desc_type=allwordssubstr&short_desc=&product=framework&component=fx&long_desc_type=substring&long_desc=&bug_file_loc_type=allwordssubstr&bug_file_loc=&bug_status=NEW&bug_status=ASSIGNED&bug_status=REOPENED&emailassigned_to1=1&emailtype1=substring&email1=&emailassigned_to2=1&emailreporter2=1&emailqa_contact2=1&emailcc2=1&emailtype2=substring&email2=&bugidtype=include&bug_id=&votes=&chfieldfrom=&chfieldto=Now&chfieldvalue=&cmdtype=doit&order=Reuse+same+sort+as+last+time&field0-0-0=noop&type0-0-0=noop&value0-0-0=>`_

.. _pages/qooxdoo_animation#usage:

Usage
=====

To create an effect instance the desired effect and pass the DOM element, which should be used for the animation, as parameter. The effect can be configured by changing the properties like ``from``, ``to``, ``duration`` and more. Once the effect is set up, it can be started by calling the ``start()`` method of the effect.

::

    var element = document.getElementById("dlAmount");
    var attention = new qx.fx.effect.core.Highlight(element);

    function update(amount)
    {
      element.innerHTML = parseInt(amount);
      attention.start();
    }

.. _pages/qooxdoo_animation#queueing_effecs:

Queueing effecs
===============

Every effect has a ``delay`` property which can be set to the amount of seconds the effect should wait before it should be executed after calling the ``start()`` method on it. You can use this property to arrange effects in the order you want them to be executed.

::

    var el = button1.getContainerElement().getDomElement();

    var psEffect = new qx.fx.effect.combination.Pulsate(el);

    // The pulsate effect will take two seconds to execute
    psEffect.seDuration(2);

    var  mvEffect = new qx.fx.effect.core.Move(el);
    mvEffect.set({
      x : 100,
      y : 200,
      delay : 2 // Wait two seconds to execute
    });

    // Start both effects at the same time
    psEffect.start();
    mvEffect.start();

.. _pages/qooxdoo_animation#writing_own_effects:

Writing own effects
===================

To create own effects, create a new class and extend from ``qx.fx.Base`` and overwrite the ``update()`` methode. You can access the DOM element of the effect by calling ``this._getElement()``.

::

    qx.Class.define("fxdemo.flickerBackground",
    {
      extend : qx.fx.Base,

      members :
      {
        update : function(value)
        {
          var element = this._getElement();

          // Value is a floating-point number between the start and end property.
          value +=""; // Convert it to a string.
          value = parseInt(value[value.length-1], 10); // Read the last digit and parse it to integer
          element.style.backgroundColor = "'" + (value % 2 == 0) ? "red" : "blue" + "'";
        }
      }
    });

.. _pages/qooxdoo_animation#list_of_effects:

List of effects
===============

The ``qx.fx.effect`` package contains 14 effects:

* **ColorFlow** Changes the background color of an element to a given initial. After that the effects waits a given amount of time before it modifies to background color back to the initial value.
* **Drop**	Moves the element to the given direction while fading it out.
* **Fade**	Fades in the specified element: it changes to opacity from a given value to another. If target value is 0, it will hide the element, if value is 1, it will show it using the “display” property.
* **Fold**	Shrinks the element in width and height until it gets invisible.
* **Grow** Resizes the element from initial dimensions to final dimensions.
* **Highlight** Cycles the background color of the element from initial to final color.
* **Move** Moves to element to the given coordinates.
* **Puff**	Resizes the element from zero to the original size of the elment and fades it in at the same time.
* **Pulsate** Fades the element in and out several times.
* **Scale** This effect scales the specified element (and its content, optionally) by given percentages.
* **Scroll** Scrolls to specified coordinates on given element.
* **Shake** Moves the element forwards and backwards several times.
* **Shrink** Resizes the element from initial to given dimensions.
* **Switch** Flickers the element one time and then folds it in.

