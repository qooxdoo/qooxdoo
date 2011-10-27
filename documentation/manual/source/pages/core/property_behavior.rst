.. _pages/property_features/behavior#initialization_behavior:

Initialization Behavior
***********************

This document summarizes some thoughts about the behavior of the initialization of properties.

.. _pages/property_features/behavior#the_problem:

The Problem
===========
Imagine a class containing a property named ``a`` with an init value, like the following:

::

    qx.Class.define("A", {
            extend : qx.core.Object,
            properties : {
              a : {
                init : "b",
                event : "changeA"
              }
            }
          });

As you can see, the property ``a`` has an init value, ``b``. Now, if you access ``a`` with its getter, you get the init value in return:

::

    var a = new A();
    a.getA();  // returns "b"

If you now set something different than the initial value, you get a change event, because the content of the property changed.

::

    a.setA("x");  // changeA fired

As far, everything behaves as desired. But if set the init value instead of a new value, the change event will be also fired. The following code shows the problem:

::

    var a = new A();
    a.setA(a.getA()); // changeA fired (first set)
    a.setA(a.getA()); // changeA NOT fired (every other set)


.. _pages/property_features/behavior#why_not_just_change_this_behaviour:

Why not just change this behaviour?
===================================
It's always hard to change a behavior like that because there is no deprecation strategy for it. If we change it, it is changed and every line of code relying on that behavior will fail. 
Even worse, the only thing we could use as a check for the wrong used behavior is to search for all properties having an init value and either an apply function or an event. Now you have to check if one of these properties could be set with the init value, before any other value has been set. If it is possible that the init value is set as first value, check if the attached apply is required to run or any listener registered to the change event of that property.
A good example in the framework where we rely on the behavior is the Spinner:

::

    // ...
      construct : function(min, value, max) {
    // ...
        if (value !== undefined) {
          this.setValue(value);
        } else {
          this.initValue();
        }
    // ...
        _applyValue: function(value, old)
    // ...
                this._updateButtons();
    // ...

The example shows the constructor and the apply of the value property. The problem begins in this case with the constructor parameter named ``value``, which is optional. So we have three cases to consider.

#. The value argument is undefined: The initValue method is called, which invokes the apply function for the property with the init value as value.
#. A value is given different as the init value: So the value is not undefined and the setter for the value property will be called, which invokes the apply function.
#. A value is given and its exactly the init value: In this case, the setter will be called with the init value. The apply method is called and invokes the ``_updateButtons`` method. This method checks the given value and enables / disabled the buttons for increasing / decreasing the spinner. So it is necessary that the apply method is at least called once that the buttons have the proper states.

The problem with a possible change of this behavior is obvious. In the third case, the apply method is not called and the buttons enabled states could be wrong without throwing an error. And they are only wrong, if the value is exactly the init value and one of the minimum or maxiumum values is the same. Because only in that scenario, one of the buttons need to be disabled.

When can it be changed?
=======================
Currently we don't plan to change it because it can have some hard to track side effects as seen in the example above and we don't have any deprecation strategy. Maybe it can be change on a major version like 2.0 but currently there are no plans to do so.