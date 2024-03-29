# Controller

The general idea of controllers is connecting a view component to a set of data
stored in a model. The kind of controller you need depends on the view
component. Currently, there are four types of controller available:

- Object Controller
- List Controller
- Tree Controller
- Form Controller

You may miss the table controller. The currently available table will not be
changed and therefore will not implement data binding features. The new virtual
table, which is currently under development, will be considered for data
binding.

In the following section, the selection will be discussed because it's a common
feature of the list and tree controller. The delegation mechanism is another
common feature of those two controllers and will also be described. After that,
each of the available controllers will be discussed in detail.

## Selection

Usually the selection of view components like the tree or the list handle their
selection with tree folder or list items. As a user of data binding, you don't
want to convert the view widgets to the model widgets. Therefore, the controller
does that mapping for you. There is a selection array available on the
controller containing the currently selected model items. When using the
selection of the controller, there is no need to deal with view widgets like
list items. It is possible to change the array in place and add / remove
something from the selection. As it is a data array, you can use all methods
defined by that array to manipulate the selection of the corresponding
controller.

Here are some samples showing how to manipulate the selection:

```javascript
    // select 'modelItem'
    controller.getSelection().setItem(0, modelItem);
    // empty the selection
    controller.getSelection().removeAll();
    // add 'modelItem' to the selected items
    controller.getSelection().push(modelItem);
```

If you want to be notified on selection changes, you can again benefit from the
data array, which offers a change event as soon as the content changes.

```javascript
    controller.getSelection().addListener("change", function(e) {});
```

This adds a listener to the `change` event of the selection array. The
controller also offer a `changeSelection` event which is not, like you might
expect, an event fired as soon as any selected item changes. It is the change
event for the selection property which holds the selection array.

For more details about the data array, check out the [models page](models.md#data-array).

## Delegate

The list and tree controller are responsible for creating and binding the child
widgets of the views. But what if you want to use something different in the
list or bind not just the label and the icon. For that purpose, the delegation
offers the possibility to enhance the controller code without having to subclass
it.

In total, there are three methods which relate to the topic of creating and
binding the child view widgets.

### configureItem

The `configureItem` function is the function which you can use if you just want
to modify the created default widgets. This gives you the opportunity to set the
labels to rich for example or modify anything else in the child widget. But this
is not the place where you want to change / add the binding behavior.

### bindItem

That place is the `bindItem` method. But you don't want to use the single value
binding all on your own and bind the stuff. Therefore, the controller offers you
a method called `bindProperty`, which takes the source path to the data, the
target property name and the options for the single value binding. The other two
parameters will just be mapped through. But keep in mind that if you use this
function, the default binding of the label and the icon are gone and the
properties used for those bindings do not work anymore. If you still want to
have the default binding, use the `bindDefaultProperties` method and pass the
two given parameters through. But keep in mind that the bindings set up with
these two methods are unidirectional, from the model to the view. If you want to
have b binding from the view to the model, use the `bindPropertyReverse` which
takes the same arguments as the `bindProperty` method.

### createItem

The last method named `createItem` gives the user the chance to add something
different as child widgets to the view. In that method you just create the
widget you want to see in the view and return the new item. But keep in mind
that the default bindings may not work on those widgets and the code will fail.
So it is always a good idea to also define its own bindings with the `bindItem`
method.

The following code shows how such a delegate could look like.

```javascript
    const delegate = {
      configureItem : function(item) {
        item.setPadding(3);
      },
      createItem : function() {
        return new qx.ui.form.CheckBox();
      },
      bindItem : function(controller, item, id) {
        controller.bindProperty("name", "label", null, item, id);
        controller.bindProperty("online", "checked", null, item, id);
      }
    };
```

The delegate defines that `CheckBox`'es should be used as child view items. As
the `CheckBox`'es don't have an icon, the `bindItem` function needs to
re-specify the bindings. It binds the name and the online property of the model
to the label and checked property of the `CheckBox`.

## Object Controller

The most simple and lightweight controller is the object controller. It connects
a model object with one or more views. The data in the model can be anything a
property can hold, i.e. a primitive data type like String or Number, or a
reference type like a map. With that you can for instance bind views like
text fields, sliders and other widgets visualizing primitive JavaScript types.
But you can not only use views as targets. A target can be anything that has a
property with the proper type. Take a look at the following code example to see
the object controller in action:

```javascript
    // create two sliders
    const slider1 = new qx.ui.form.Slider();
    const slider2 = new qx.ui.form.Slider();
    // create a controller and use the first slider as a model
    const controller = new qx.data.controller.Object(slider1);
    // add the second slider as a target
    controller.addTarget(slider2, "value", "value");
```

This code snippet ensures that every value set by slider1 will automatically be
set as value of slider two. As you can see, the object controller only wraps the
fundamental single-value binding, trying to make its usage a little easier.

## List Controller

A list controller could - as the name suggests - be used for list-like widgets.
The supported list-like widgets in Qooxdoo are List, SelectBox and ComboBox, all
in the qx.ui.form package. The controller expects a data array as a data model,
that contains the model objects. These objects are displayed in the list and can
either have some primitive type or be real Qooxdoo objects. The following code
snippet shows how to bind an array of strings to a list widget:

```javascript
    // create the model
    const model = new qx.data.Array(["a", "b", "c", "d", "e"]);
    // create a list widget
    const list = new qx.ui.form.List();
    // create the controller
    const listController = new qx.data.controller.List(model, list);
```

Now every change in the model array will invoke a change in the list widget.

As a unique feature of the list controller a filtering method is included. You
can assign a filter function to the controller and the results will be filtered
using your given function.

## Tree Controller

Of course, also the tree does have its own controller. With that controller the
Tree widget can automatically be filled with data from Qooxdoo objects
containing the data. As model nodes for the tree, only Qooxdoo objects are
allowed containing at least two properties, one for holding its own children in
a data array and a second one holding the name of the node which should be
showed as the label of the tree folder widgets. Imagine that a model class
called Node (inheriting from `qx.core.Object`) is available containing the two
already mentioned properties called ch for the children and n for the name. The
following code will bind a data model containing Node objects to a tree widget:

```javascript
    // create the model
    const rootNode = new Node();
    rootNode.setN("root");
    const childNode = new Node();
    childNode.setN("child");
    rootNode.getCh().push(childNode);
    // create the tree view
    const tree = new qx.ui.tree.Tree();
    // create the controller
    const treeController = new qx.data.controller.Tree(rootNode, tree, "ch", "n");
```

After that code snippet, every change in the name or of the children will be
automatically mapped into the tree view. Selecting one of the tree folders will
put the corresponding Node object into the selection array of the controller.

## Form Controller

Also, forms have a special controller. The form controller uses a
`qx.ui.form.Form` as target and an [Object controller](controller.md#object-controller) for the
bidirectional bindings. The usage equals to the usage of all other controllers.
The main properties of it are the model and target property. Given both, the
controller connects the model and the target. An additional feature of the form
controller is the possibility to create the model for a given form. See the
following code to get an idea of using it.

```javascript
    // a form is available as 'form'
    // create the controller
    const formController = new qx.data.controller.Form(null, form);
    // create the model
    const model = formController.createModel();
```

If you need additional information on forms, see
[form handling documentation](../../desktop/gui/forms.md#form-object). After
executing this code, the controller and the model variable do have the model
available and therefore, the controller can set up the bindings.

## Combining Controller

As a more advanced example we connect the selection of a tree to a list.
Therefore, we extend the code sample of the tree controller section.

```javascript
    // create a list widget
    const list = new qx.ui.form.List();
    // create the controller
    const listController = new qx.data.controller.List(null, list, "n");
    // bind the selection of the tree to the list
    treeController.bind("selection", listController, "model");
```

The example shows how the controller can work pretty well together with the
single value binding. The trick is not to set the model of the list controller
at creation time. The model will be set by the single value binding from the
tree controllers selection. This works because the selection will be provided as
data array.
