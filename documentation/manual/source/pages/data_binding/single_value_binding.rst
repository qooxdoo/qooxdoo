.. _pages/data_binding/single_value_binding#single_value_binding:

Single Value Binding
====================

The purpose of single value binding is to connect one property to another by tying them together. The connection is always in one direction only. If the reverse direction is needed, another binding needs to be created. The binding will be achieved by an event handler which assigns the data given by the event to the target property. Therefore it is necessary for the source event to fire a change event or some other kind of data event.
The single value binding is mostly a basis for the higher concepts of the data binding.

.. _pages/data_binding/single_value_binding#binding_a_single_property_to_another_property:

Binding a single property to another property
---------------------------------------------

The simplest form of single value binding is to bind one property to another. Technically the source property needs to fire a change event. Without that no binding is possible. But if this requirement is met, the binding itself is quite simple. You can see this in the following code snippet, which binds two properties of the label value together:

::

    var label1 = new qx.ui.basic.Label();
    var label2 = new qx.ui.basic.Label();

    label1.bind("value", label2, "value");

``label1`` is the source object to bind, with the following three arguments to that call: 

#. The name of the property which should be the source of the binding.
#. The target object which has the target property.
#. The name of the property as the endpoint of the binding.

With that code every change of the value property of ``label1`` will automatically synchronize the value property of ``label2``.

.. _pages/data_binding/single_value_binding#binding_a_data_event_to_property:

Binding a data event to property
--------------------------------
In some cases in the framework, there is only a change event and no property. For that case, you can bind a data event to a property. One common case is the ``TextField`` widget, which does not have a property containing the value of the ``TextField``. It only has getter / setter and a change event for that, so it has the stuff needed for the binding but its not implemented as a property. Therefor you can use the ``changeValue`` event and bind that to a target property as you can see in the example snippet.
The API is almost the same as in the property binding case.

::

    var textField = new qx.ui.form.TextField();
    var label = new qx.ui.basic.Label();

    textField.bind("changeValue", label, "value");

As you can see, the same method has been used. The difference is, that the first argument is a data event name and not a property name.

.. _pages/data_binding/single_value_binding#bind_a_property_chain_to_another_property:

Bind a property chain to another property
-----------------------------------------
A more advanced feature of the single value binding is to bind a hierarchy of properties to a target property. To understand what that means take a look at the following code. For using that code a qooxdoo class is needed which is named ``Node`` and does have a ``child`` and a ``name`` property, both firing change events.

::

    // create the object hierarchy
    var a = new Node("a");      // set the name to „a“
    var b = new Node("b");      // set the name to „b“
    a.setChild(b);

    // bind the property to a labels value
    a.bind("child.name", label, "value");

Now every change of the ``name`` of ``b`` will change the labels value. But also a change of the ``child`` property of ``a`` to another Node with another name will change the value of the label to the new name. 
With that mechanism a even deeper binding in a hierarchy is possible. Just separate every property with a dot. But always keep in mind that every property needs to fire a change event to work with the property binding.

.. _pages/data_binding/single_value_binding#bind_an_array_to_a_property:

Bind an array to a property
---------------------------
The next step in binding would be the ability to bind a value of an array. That's possible but the array needs to be a special data array because the binding component needs to know when the array changes one of its values. Such an array is the ``qx.data.Array`` class. It wraps the native array and adds the change event to every change in the array. The following code example shows what a binding of an array could look like. As a precondition there is an object ``a`` having a property of the ``qx.data.Array`` type and that array containing strings.

::

    // bind the first array element to a label's value
    a.bind("array[0]", labelFirst, "value");

    // bind the last array element to a label's value
    a.bind("array[last]", labelFirst, "value");

You can use any numeric value in the brackets or the string value ``last`` which maps to ``length - 1``. That way you can easily map the top of a stack to something else.
For binding of an array the same method will be used as for the binding of chains. So there is also the possibility to combine these two things and use arrays in such property chains.

.. _pages/data_binding/single_value_binding#options_conversion_and_validation:

Options: Conversion and Validation
----------------------------------
The method for binding introduced so far has the same set of arguments. The first three arguments are mostly the same. There is a forth argument called options. This should be a map containing the options itself. In that you can specify three things currently:
  * **converter**: A own converter which is a function with four arguments returning the converted value. (See the API for more details)
  * **onUpdate**: A key in the options map under which you can add a method. This method will be called on a validation case if the validation was successful.
  * **onSetFail**: The counterpart to onUpdate which will be called if the validation fails.

In addition there is a built in default conversion which takes care of the default conversion cases automatically. Default cases are, for example, string to number conversion. To get that working it is necessary to know the desired target type. This information is taken from the check key in the property definition of the target property.  

.. _pages/data_binding/single_value_binding#managing_bindings:

Managing bindings
-----------------
If you want to manage the bindings, there are some ways to get that. First aspect of managing is showing the existing bindings. You can find all these function on the static ``qx.data.SingleValueBinding`` class or parts of it on every object.

  * **getAllBindingsForObject** is a function which is in the data binding class and returns all bindings for the given object. The object needs to be the source object.
  * **getAllBindings** returns all bindings in a special map for all objects.

Another way of managing is removing. There are three ways to remove bindings.

  * **removeBindingFromObject** removes the given binding from the given source object. As an id you should use exactly the id returned during the creation of the binding.
  * **removeAllBindingsForObject** removes all binding from the source object. After that, the object is not synchronized anymore.
  * **removeAllBindings** removes all single value bindings in the whole application. Be careful to use that function. Perhaps other parts of the application use the bindings and also that will be removed!

.. _pages/data_binding/single_value_binding#debugging:

Debugging
---------
Working with bindings is in most cases some magic and it just works. But the worse part of that magic is, if it does not work. For that the data binding component offers two methods for debugging on the static ``qx.data.SingleValueBinding`` class.

  * **showBindingInLog** shows the given binding in the qooxdoo logger as a string. The result could look something like this: *Binding from 'qx.ui.form.TextField[1t]' (name) to the object 'qx.ui.form.TextField[1y]' (name).* That shows the source object and property and the target object and property.
  * **showAllBindingsInLog** shows all bindings in the way the first method shows the bindings.

.. _pages/data_binding/single_value_binding#tech_notes:

Tech notes
----------
For everyone who is interested on how that whole thing works, here are some small notes on the inside of the data binding.
Every binding function maps to the event binding function. This is where the heart of the data binding lies. In that function a listener will be added to the source object listening to the change event. The key part of the listener is the following code part.

::

    targetObject["set" + qx.lang.String.firstUp(targetProperty)](data);            

In that line the listener sets the data given by the data event to the target property.
