Data Binding
============

Data binding is a [concept](http://en.wikipedia.org/wiki/Data_binding) by which two data items are bound, so that changes to one are propagated to the second, and vice versa. This requires the possibility to detect such changes during runtime. In qooxdoo, class properties fulfill this requirement.

Using data binding allows you to e.g. keep two widgets automatically synchronized over the runtime of your application, although they might be spatially separated and have wildly different visual representations (e.g. a text field and a spinner).

Data binding is a functionality that allows to connect data from a source to a target. The entire topic can be divided into a low-level part, called "single value binding", and some higher-level concepts involving stores and controllers.

The main idea
-------------

The main idea of qooxdoo's data binding component is best summarized by the following diagram.

![](databindingarchitecture.jpg)

As you can see data binding includes five major components, which will be described in more detail in the following sections.

### Data

The data part is where the raw data is stored and can be retrieved from. This can be a plain local file, a regular web server or even a web service. There are all sources of data possible depending on the implementation of the actual store.

### Store

The store component is responsible for fetching the data from its source and for including it into a data model of an application. For more info about the available store components see the stores section below.

### Model

The model is the centerpiece of data binding. It holds the data and acts as an integration point for the store and for the controller. The stores provide a smart way to automatically create the models classes during runtime. Take a look at the models for details.

### Controller

The main task of the controller components is to connect the data in the model to the view components. Details are available in the controller section. The base layer of all controllers, the Single Value Binding is explained later.

### View

The views for data binding can be almost any widget out of qooxdoo's rich set of widgets, depending on the type of controller. qooxdoo's data binding is not limited to some predefined data bound widgets. Please note that one of the most prominent data centric widgets, the virtual Table, currently still has its own model based layer and is not covered by the new data binding layer. The new infrastructure for virtual widgets is expected to nicely integrate the upcoming data binding layer, though.

## Store Component

The main purpose of the store components is to load data from a source and convert that data into a model. The task of loading data and converting the data into a model has been split up. The store itself takes care of loading the data but delegates the creation of model classes and instances to a marshaller. More information about the marshalling and the models itself can be found in the models section.

### JSON Store

The JSON store takes an URL, fetches the given data from that URL and converts the data using the JSON marshaller to qooxdoo model instances, which will be available in the model property after loading. The state of the loading process is mapped to a state property. For the loading of the data, a `qx.io.request.Xhr` will be used in the store.

The following code shows how to use the JSON data store.

    var url = "json/data.json";
    var store = new qx.data.store.Json(url);

After setting the URL during the creation process, the loading will begin immediately. As soon as the data is loaded and converted, you can access the model with the following code.

    store.getModel();

### JSONP Store

The [JSONP](http://ajaxian.com/archives/jsonp-json-with-padding) store is based on the JSON store but uses a script tag for loading the data. Therefore, a parameter name for the callback and an URL must be specified.

The following code shows how to use the JSONP data store.

    var url = "json/data.json";
    var store = new qx.data.store.Jsonp(url, null, "CallbackParamName");

After setting the URL and the callback parameter name during the creation process, the loading will begin immediately.

### YQL Store

YQL is the [Yahoo! Query Language](http://developer.yahoo.com/yql/). Yahoo! describes it as *"[...] an expressive SQL-like language that lets you query, filter, and join data across Web services."* Based on the JSONP store, qooxdoo offers a YQL store, where you can specify the YQL queries and qooxdoo handles the rest.

The following code demonstrates how to fetch some twitter messages.

    var query = "select * from twitter.user.timeline where id='wittemann'";
    var store = new qx.data.store.Yql(query);

### Offline Store

The Offline store uses HTML local or session storage to store the data on the client. That can be used for offline storage as well as for other storage purposes on the client. You should use the core/environment checks to make sure that the used storage technology is supported by the environment you want to run your code in.

The following code demonstrates how to initialize the data store.

    if (qx.core.Environment.get("html.storage.local") {
      var store = new qx.data.store.Offline("my-test-key", "local");
      if (store.getModel() == null) {
        // initialize model ...
      }
    }

### Combining with controllers

As described in the section above, you can access the model in the property after loading. The best solution is to use the model with a controller and then bind the model properties with Single Value Binding \<single\_value\_binding\> together. The code for this could look something like this.

    store.bind("model", controller, "model");

Using the Single Value Binding \<single\_value\_binding\>, the binding handles all the stuff related with the loading of the model data. That means that the data will be available in the controller as soon as its available in the store.

## Model Component

The model is the centerpiece of data binding. It holds the data and acts as an integration point for the stores\<stores\> and for the controller \<controller\>. Almost all models are plain qooxdoo classes holding the data in simple properties, which are configured to fire events on every change. These change events are the most important part of the models and the reason, why plain %{JS} objects are not enough as models. The same is true for native %{JS} arrays. Since they do not fire events when items are changed as well, a complementary array is added for data binding purposes. More details about that in the data array\_ section.

Still, there is no need to manually write own model classes for every data source you want to work with. The marshallers provide a smart way to automatically create these classes during runtime. Take a look at the JSON marshaller\_ for details.

In the following sections, we first take a look at the models basics and how they work. After that, we dig into the role of arrays and how that is solved. As a last section, we check out how the model creation is done in qooxdoo, because you don't need to write all the simple models yourself.

### Structure

As already mentioned in the introduction of this chapter, models are plain qooxdoo objects. The main idea of such a model is to hold all data in properties, which fire change events as soon as new data is available. Lets take a look at a simple example in which we use JSON data to demonstrate how models look. The data in the example looks like this:

    {
      s: "string",
      b: true,
      a: []
    }

A corresponding model should now be an object, which class defines three properties, named `s`, `b` and `a`. Lets take a look at the following qooxdoo code, in which we assume that we have a fitting model:

    var model = new ExampleModel(); // this returns a fitting model
    model.getS(); // return the value of the property 's' which is "string"
    model.setB(false); // will fire a change event for the property 'b'

I guess it's clear now, how models are structured. There is not much code or magic about them, but they are the most important part in the whole binding scenario.

### Data Array

If we take a second look at the example we used above, we also added an array as value of property `a`. This array should not be an plain %{JS} array, instead it should be a qooxdoo data array, which Class is located in `qx.data.Array`. The reason for that should be quite obvious right now, the binding needs to get an event as soon as some data changed to do all the necessary updates. As regular arrays can't offer such notifications, we added our own array implementation to the data binding layer. The data array is as close as possible to the native array but in some core things, we needed to change the API. The major difference is the accessing of items in the array. The following sample code, based on the sample above, shows the differences:

    var array = model.getA();
    array.setItem(0, "content"); // equals 'array[0] = "content"' and fires a change event
    array.getItem(0); // equals 'array[0]' and returns "content"
    array.length; // like the native API and returns '1'

You see, the read and write access needs to be done with the designated methods to ensure the firing of the events. But all the other API, like `push`, `pop` or `splice` is all the same and also capable of the events. Just take a look at the [API-Documentation of the array](http://demo.qooxdoo.org/{version}/apiviewer/#qx.data.Array) for more information.

### Importance of events

The two sections above explained how models look and why. The most mentioned reason is the need for change events, which gives them also an important role in the data binding. Check out the separate page about events in data binding.

### Disposing

Those of you familiar with qooxdoo and its objects should know, that disposing is necessary. This is also true for model objects and data arrays. The model objects do have one special thing, the do a deep disposing, when created with the marshaller, which we get to know in the following section.

### JSON Marshaller

The marshaller takes care of converting JavaScript Objects into qooxdoo classes and instances. You can initiate each of the two jobs with a method.

#### toClass

This method converts a given JavaScript object into model classes. Every class will be stored and available in the `qx.data.model` namespace. The name of the class will be generated automatically depending on the data which should be stored in it. As an optional parameter you can enable the inclusion of bubbling events for every change of a property. If a model class is already created for the given data object, no new class will be created.

#### toModel

The method requires that the classes for the models are available. So be sure to call the `toClass` method before calling this method. The main purpose of this method is to create instances of the created model classes and return the model corresponding to the given data object.

#### createModel (static)

This method is static and can be used to invoke both methods at once. By that, you can create models for a given JavaScript objects with one line of code:

    var model = qx.data.marshal.Json.createModel({a: {b: {c: "test"}}});

### How to get my own code into the model?

What if you want to to bring your own code to the generated model classes or if you even want to use your own model classes? That's possible by adding and implementing a delegate to the data store. You can either

-   Add your code by supporting a superclass for the created model classes.
-   Add your code as a mixin to the created model classes.
-   Use your own class instead of the created model classes.

Take a look at the API-Documentation of the [qx.data.store.IStoreDelegate](http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.data.store.IStoreDelegate) to see the available methods and how to implement them.

## Controller Component

The general idea of controllers is connecting a view component to a set of data stored in a model. The kind of controller you need depends on the view component. Currently there are four types of controller available:

-   Object Controller
-   List Controller
-   Tree Controller
-   Form Controller

You may miss the table controller. The currently available table will not be changed and therefore will not implement data binding features. The new virtual table, which is currently under development, will be considered for data binding.

In the following section, the selection will be discussed because it's a common feature of the list and tree controller. The delegation mechanism is another common feature of those two controllers and will also be described. After that, each of the available controllers will be discussed in detail.

### Selection

Usually the selection of view components like the tree or the list handle their selection with tree folder or list items. As a user of data binding, you don't want to convert the view widgets to the model widgets. Therefore, the controller does that mapping for you. There is a selection array available on the controller containing the currently selected model items. When using the selection of the controller, there is no need to deal with view widgets like list items. It is possible to change the array in place and add / remove something from the selection. As it is a data array, you can use all methods defined by that array to manipulate the selection of the corresponding controller.

Here are some samples showing how to manipulate the selection:

    // select 'modelItem'
    controller.getSelection().setItem(0, modelItem);
    // empty the selection
    controller.getSelection().removeAll();
    // add 'modelItem' to the selected items
    controller.getSelection().push(modelItem);

If you want to be notified on selection changes, you can again benefit from the data array, which offers a change event as soon as the content changes.

    controller.getSelection().addListener("change", function(e) {});

This adds a listener to the `change` event of the selection array. The controller also offer a `changeSelection` event which is not, like you might expect, an event fired as soon as any selected item changes. It is the change event for the selection property which holds the selection array.

For more details about the data array, check out the models page.

### Delegate

The list and tree controller are responsible for creating and binding the child widgets of the views. But what if you want to use something different in the list or bind not just the label and the icon. For that purpose, the delegation offers the possibility to enhance the controller code without having to subclass it.

In total, there are three methods which relate to the topic of creating and binding the child view widgets.

#### configureItem

The `configureItem` function is the function which you can use if you just want to modify the created default widgets. This gives you the opportunity to set the labels to rich for example or modify anything else in the child widget. But this is not the place where you want to change / add the binding behavior.

#### bindItem

That place is the `bindItem` method. But you don't want to use the single value binding all on your own and bind the stuff. Therefore, the controller offers you a method called `bindProperty`, which takes the source path to the data, the target property name and the options for the single value binding. The other two parameters will just mapped through. But keep in mind that if you use this function, the default binding of the label and the icon is gone and the properties used for those bindings do not work anymore. If you still want to have the default binding, use the `bindDefaultProperties` method and pass the two given parameters through. But keep in mind that the bindings set up with these two methods are unidirectional, from the model to the view. If you want to have b binding from the view to the model, use the `bindPropertyReverse` which takes the same arguments as the `bindProperty` method.

#### createItem

The last method named `createItem` gives the user the chance to add something different as child widgets to the view. In that method you just create the widget you want to see in the view and return the new item. But keep in mind that the default bindings may not work on those widgets and the code will fail. So it is always a good idea to also define its own bindings with the `bindItem` method.

The following code shows how such a delegate could look like.

    var delegate = {
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

The delegate defines that `CheckBox`'es should be used as child view items. As the `CheckBox`'es don't have an icon, the `bindItem` function needs to re-specify the bindings. It binds the name and the online property of the model to the label and checked property of the `CheckBox`.

### Object Controller

The most simple and lightweight controller is the object controller. It connects a model object with one or more views. The data in the model can be anything a property can hold, i.e. a primitive data type like String or Number, or a reference type like a map. With that you can for instance bind views like textfields, sliders and other widgets visualizing primitive JavaScript types. But you can not only use views as targets. A target can be anything that has a property with the proper type. Take a look at the following code example to see the object controller in action:

    // create two sliders
    var slider1 = new qx.ui.form.Slider();
    var slider2 = new qx.ui.form.Slider();
    // create a controller and use the first slider as a model
    var controller = new qx.data.controller.Object(slider1);
    // add the second slider as a target
    controller.addTarget(slider2, "value", "value");

This code snippet ensures that every value set by slider1 will automatically be set as value of slider two. As you can see, the object controller only wraps the fundamental single-value binding, trying to make its usage a little bit easier.

### List Controller

A list controller could - as the name suggests - be used for list-like widgets. The supported list-like widgets in qooxdoo are List, SelectBox and ComboBox, all in the qx.ui.form package. The controller expects a data array as a data model, that contains the model objects. These objects are displayed in the list and can either have some primitive type or be real qooxdoo objects. The following code snippet shows how to bind an array of strings to a list widget:

    // create the model
    var model = new qx.data.Array(["a", "b", "c", "d", "e"]);
    // create a list widget
    var list = new qx.ui.form.List();
    // create the controller
    var listController = new qx.data.controller.List(model, list);

Now every change in the model array will invoke a change in the list widget.

As a unique feature of the list controller a filtering method is included. You can assign a filter function to the controller and the results will be filtered using your given function.

### Tree Controller

Of course, also the tree does have its own controller. With that controller the Tree widget can automatically be filled with data from qooxdoo objects containing the data. As model nodes for the tree, only qooxdoo objects are allowed containing at least two properties, one for holding its own children in a data array and a second one holding the name of the node which should be showed as the label of the tree folder widgets. Imagine that a model class called Node (inheriting from qx.core.Object) is available containing the two already mentioned properties called ch for the children and n for the name. The following code will bind a data model containing Node objects to a tree widget:

    // create the model
    var rootNode = new Node();
    rootNode.setN("root");
    var childNode = new Node();
    childNode.setN("child");
    rootNode.getCh().push(childNode);
    // create the tree view
    var tree = new qx.ui.tree.Tree();
    // create the controller
    var treeController = new qx.data.controller.Tree(rootNode, tree, "ch", "n");

After that code snippet, every change in the name or of the children will be automatically mapped into the tree view. Selecting one of the tree folders will put the corresponding Node object into the selection array of the controller.

### Form Controller

Also forms do have a special controller. The form controller uses a `qx.ui.form.Form` as target and a Object controller for the bidirectional bindings. The usage equals to the usage of all other controllers. The main properties of it are the model and target property. Given both, the controller connects the model and the target. An additional feature of the form controller is the possibility to create the model for a given form. See the following code to get an idea of using it.

    // a form is available as 'form'
    // create the controller
    var formController = new qx.data.controller.Form(null, form);
    // create the model
    var model = formController.createModel();

If you nee additional information on forms, see form handling
documentation. After executing this code, the controller and the model variable do have the model available and therefore, the controller can set up the bindings.

### Combining Controller

As a more advanced example we connect the selection of a tree to a list. Therefore we extend the code sample of the tree controller section.

    // create a list widget
    var list = new qx.ui.form.List();
    // create the controller
    var listController = new qx.data.controller.List(null, list, "n");
    // bind the selection of the tree to the list
    treeController.bind("selection", listController, "model");

The example shows how the controller can work pretty well together with the single value binding. The trick is not to set the model of the list controller at creation time. The model will be set by the single value binding from the tree controllers selection. This works because the selection will be provided as data array.

##  Events

Events are a key concept of data binding. They are responsible for notifying every connected view (which can be more than one) to update their representation of the data stored in the model. You can see the events as a nervous system for your data bound app. In general, there are two different kinds of events.

### Change Events

The basic events used in the data binding are the change events of the qooxdoo property system. You will find some details about the change events of properties in the documentation. Those events are fired as soon as a property changes.

#### Array

There is also an event for data arrays, which will fire events on every change as well. This event is called `change` and is a data array containing additional information. The information is stored as data in a map and contains the following keys.
-   `start`: The start index of the change e.g. 0 if the index 0 has been written.
-   `end`: The end index of the change. This might often be the same as the start index but there are some operation which might take action on a range of items like `sort` or `splice`.
-   `type`: The type of the change as a String. This can be 'add', 'remove' or 'order'.
-   `items`: The items which has been changed (as a JavaScript array).

### Bubbling Events

Regular change events might not be enough in every use case. If we consider a huge tree like data model, it's quite a lot of work to add a listener to every model object to get updates for the view. Therefore, the data binding also supports bubbling events named `changeBubbles`. These events are provided by a mixin named [MEventBubbling](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.data.marshal.MEventBubbling).

#### Enabling

These bubbling events are disabled by default because firing an additional event for every change is not always necessary. There are two ways for enabling the events. The most easy and preferred way is to use the marhsaler to create the models. You will find more details about how to do that in the marhsaler section. A second way is to include the mixin to your own classes. More details on that in the [API documentation of that mixin](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.data.marshal.MEventBubbling).

#### Details

This event, like the regular change event of the Array, also offers additional information on the kind of change and where the change initially happened. The data of the event contains a map offering the following keys:

> -   `value`: The new value of the property.
> -   `old`: The old value of the property.
> -   `name`: The name of the property including its parents e.g. `bar[3].baz`.
> -   `item`: The model item that has been changed.

#### Array

The data array also offers bubble events with the same details. But the arrays don't have properties which change. You can see the index of the array as property instead. So here is a sample what a unshift action on an array might look like:

    var array = new qx.data.Array("a", "b", "c");
    array.addListener("changeBubble", function(e) {
      var data = e.getData();
      // do something with the data
    });
    array.unshift("X");

Think of the unshift action as something which manipulates the index 0 because it adds one item at the index 0 and moves every item by one index. This unshift will produce the following data in the changeBubble event:

> -   `value`: `['X']` (An array containing the new value at the index 0)
> -   `old`: `['a']` (An array containing the old value at the index 0)
> -   `name`: `0` (The name of the changed index)
> -   `item`: *\<array\>* (The array itself)

The properties `value` and `old` are always an array because there are operations which change several indexes at once like `splice`.

## Single Value Binding

The purpose of single value binding is to connect one property to another by tying them together. The connection is always in one direction only. If the reverse direction is needed, another binding needs to be created. The binding will be achieved by an event handler which assigns the data given by the event to the target property. Therefore it is necessary for the source event to fire a change event or some other kind of data event. The single value binding is mostly a basis for the higher concepts of the data binding.

### Binding a single property to another property

The simplest form of single value binding is to bind one property to another. Technically the source property needs to fire a change event. Without that no binding is possible. But if this requirement is met, the binding itself is quite simple. You can see this in the following code snippet, which binds two properties of the label value together:

    var label1 = new qx.ui.basic.Label();
    var label2 = new qx.ui.basic.Label();

    label1.bind("value", label2, "value");

`label1` is the source object to bind, with the following three arguments to that call:

1.  The name of the property which should be the source of the binding.
2.  The target object which has the target property.
3.  The name of the property as the endpoint of the binding.

With that code every change of the value property of `label1` will automatically synchronize the value property of `label2`.

### Binding a data event to property

Some properties of objects used as models can only be accessed through a method or an event. Those properties cannot be bound directly, but they can be bound through a method or an event that references them. One common case is the TextField widget, which does not have a direct `value` property, unlike the Label of the previous example, which does have a `value` property. The `value` of a TextField is only addressed through getter / setter methods and change events. Indirectly therefore Textfield does indeed have a property for binding, though it is not implemented as a direct property. Using the `changeValue`\` event, the value can be bound as is shown in the example snippet. The API is essentially the same as the property binding case.

    var textField = new qx.ui.form.TextField();
    var label = new qx.ui.basic.Label();

    textField.bind("changeValue", label, "value");

As you can see, the same method has been used. The difference is that the first argument is a data event name and not a property name.

In a similar fashion, a controller can bind to the implicit `value` property of the TextField:

    var textField = new qx.ui.form.TextField();

    // create the controller
    var controller = new qx.data.controller.Object(model);

    // connect the name
    controller.addTarget(textfield, "value", "name", true);

In this case the binding code translates the "value" property into getValue() and setValue() methods.

### Bind a property chain to another property

A more advanced feature of the single value binding is to bind a hierarchy of properties to a target property. To understand what that means take a look at the following code. For using that code a qooxdoo class is needed which is named `Node` and does have a `child` and a `name` property, both firing change events.

    // create the object hierarchy
    var a = new Node("a");      // set the name to „a“
    var b = new Node("b");      // set the name to „b“
    a.setChild(b);

    // bind the property to a labels value
    a.bind("child.name", label, "value");

Now every change of the `name` of `b` will change the labels value. But also a change of the `child` property of `a` to another Node with another name will change the value of the label to the new name. With that mechanism a even deeper binding in a hierarchy is possible. Just separate every property with a dot. But always keep in mind that every property needs to fire a change event to work with the property binding.

### Bind an array to a property

The next step in binding would be the ability to bind a value of an array. That's possible but the array needs to be a special data array because the binding component needs to know when the array changes one of its values. Such an array is the `qx.data.Array` class. It wraps the native array and adds the change event to every change in the array. The following code example shows what a binding of an array could look like. As a precondition there is an object `a` having a property of the `qx.data.Array` type and that array containing strings.

    // bind the first array element to a label's value
    a.bind("array[0]", labelFirst, "value");

    // bind the last array element to a label's value
    a.bind("array[last]", labelFirst, "value");

You can use any numeric value in the brackets or the string value `last` which maps to `length - 1`. That way you can easily map the top of a stack to something else. For binding of an array the same method will be used as for the binding of chains. So there is also the possibility to combine these two things and use arrays in such property chains.

### Options: Conversion and Validation

The method for binding introduced so far has the same set of arguments. The first three arguments are mostly the same. There is a forth argument called options. This should be a map containing the options itself. In that you can specify three things currently:
-   **converter**: A own converter which is a function with four arguments returning the converted value. (See the API for more details)
-   **onUpdate**: A key in the options map under which you can add a method. This method will be called on a validation case if the validation was successful.
-   **onSetFail**: The counterpart to onUpdate which will be called if the validation fails.

In addition there is a built in default conversion which takes care of the default conversion cases automatically. Default cases are, for example, string to number conversion. To get that working it is necessary to know the desired target type. This information is taken from the check key in the property definition of the target property.

### Managing bindings

If you want to manage the bindings, there are some ways to get that. First aspect of managing is showing the existing bindings. You can find all these function on the static `qx.data.SingleValueBinding` class or parts of it on every object.

> -   **getAllBindingsForObject** is a function which is in the data binding class and returns all bindings for the given object. The object needs to be the source object.
> -   **getAllBindings** returns all bindings in a special map for all objects.

Another way of managing is removing. There are three ways to remove bindings.

> -   **removeBindingFromObject** removes the given binding from the given source object. As an id you should use exactly the id returned during the creation of the binding.
> -   **removeAllBindingsForObject** removes all binding from the source object. After that, the object is not synchronized anymore.
> -   **removeAllBindings** removes all single value bindings in the whole application. Be careful to use that function. Perhaps other parts of the application use the bindings and also that will be removed!

### Debugging

Working with bindings is in most cases some magic and it just works. But the worse part of that magic is, if it does not work. For that the data binding component offers two methods for debugging on the static `qx.data.SingleValueBinding` class.

> -   **showBindingInLog** shows the given binding in the qooxdoo logger as a string. The result could look something like this: *Binding from 'qx.ui.form.TextField[1t]' (name) to the object 'qx.ui.form.TextField[1y]' (name).* That shows the source object and property and the target object and property.
> -   **showAllBindingsInLog** shows all bindings in the way the first method shows the bindings.

### Tech notes

For everyone who is interested on how that whole thing works, here are some small notes on the inside of the data binding. Every binding function maps to the event binding function. This is where the heart of the data binding lies. In that function a listener will be added to the source object listening to the change event. The key part of the listener is the following code part.

    targetObject["set" + qx.lang.String.firstUp(targetProperty)](data);

In that line the listener sets the data given by the data event to the target property.
