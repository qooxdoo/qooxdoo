Enterprise Application Development
==================================

This is a summary of "best practices" recommended for developing medium to large-scale qooxdoo applications.

Widget Handling
---------------

### Share Instances

Creating new widgets is expensive in terms of computation time and memory consumption. Further more, disposing of objects in JavaScript does not guarantee that the used memory is freed in a timely manner. Especially Internet Explorer is known to run the garbage collector only on some particular events, like minimizing the browser window.

As a consequence widget references should be kept if it makes sense to reuse them later. If a widget is no longer needed at some point, it may be best to pool it and reconfigure it on later use.

-   In cases where new data arrives it is better to update a set of widgets instead of replacing existing widgets with newly created ones.
-   It is a good idea to use singletons were applicable. For example: dialog boxes, where only one is visible at a time, could be shared even when the interface should behave like (or better: emulate) multiple instances.
-   Even complex dialogs or complete interfaces could be implemented as a singleton.
-   Pooling is an alternative design pattern when singletons are not enough to fulfill the needs.
-   It is better to pool full-blown dialogs than pooling single widget instances. Start with pools for dialogs. If you are done with that continue with single widgets/objects/events.
-   Reconfiguring existing instances is typically a lot faster than creating new ones.
-   Use factories to create widget instances. These factories can hide the creation and pooling of widgets (e.g. `createMenuButton()`).
-   Create widgets on demand. For example in tab pages it can be useful to create the instances of hidden tab pages only when the page gets visible for the first time and then save them for later use.
-   Do not dispose instances when there may be *a chance*, that you need an (almost) identically configured instance again within the same user session. This typically applies to dialogs e.g. error reporting, message boxes, confirm dialogs, etc.

### Initialize Incrementally

-   Normally big applications consist of multiple parts which are not visibile initially. This is true for many things like hidden tab pages or not yet opened dialogs.
-   As the entire load process and evaluation of JavaScript costs precious time, it is a good idea to load functionality only when needed ("on demand").
-   The Generator \<tool/generator/generator\> makes it possible to easily split application logic into so-named "parts". This experimental feature will be available with 0.7.3 in a preliminary version and is expected to be integrated into future 0.8 releases. Besides the alpha status this new generator is already used by some large applications.
-   To allow such a functionality, it is a good idea to separate application parts from each other as good as possible. It is still possible to connect them using callbacks: The usage of another part of the application is checked in all places and in the place where the initialisation should happen a callback is inserted which waits for the initialization of the new classes.

### Avoid Hacks

This should always be the goal, especially when developing large applications. Regarding widget handling this means to avoid

-   the call of `flushGlobalQueues()` to workaround layout issues
-   timeouts whenever possible
-   the combination of both ;-)

To be clear: the use of timeouts is not wrong by default. There are scenarios in which a timeout can be reasonable like giving the browser the time to paint the selection at a certain widget before modifying another widget. Nevertheless be careful with every timeout and document its purpose in the code clearly. With every timeout a part of your code is executed asynchronously and you loose control over the flow of your application. This can result in errors which are very difficult to debug.

Fine-grained Events
-------------------

-   Events for changes in data models tend to loose information about the underlaying change.
-   For performance reasons it is better to fire more specific events than less specific events, even if this means more work for the developer.
-   In many cases it is a good idea to invest more time to structurize data changes (when the backend is not yet able to do this) into multiple events than fire one generic event which updates many areas of the application (where many of them are not needed in this specific case).

Tune the Backend
----------------

-   Backends must change. In traditional web pages the backend sends the full result to the client, which is OK when rendering whole web sites.
-   In more interactive AJAX based applications it is better just to send changes to the client instead of full data sets. A possibility would be something like a transaction-log known from journaled filesystems.

Wrapping Backend Data
---------------------

**Avoid passing around JSON data structures in JavaScript functions.**

Most AJAX applications hold data in a local data model. This data is most commonly sent as JSON data structures by the server and it is tempting to pass around bits of this JSON data in the JavaScript application code. Don't do this :-). It is worth the effort to wrap this data into accessor classes and pass around instances of these classes instead.

Lets take an addressbook as example. The JSON data could look like:

    var address = {
      "firstname" : "Klara",
      "lastname" : "Korn",
      "birthday" : 275353200000
    }

A function *could* refer to this data directly by accessing the data fields.

    // Attention: Not recommended coding style!
    function printContact(addressData) {
      var contact = addressData.firstname;
      if (addressData.middlename) {
        contact += " " + addressData.middlename;
      }      
      contact += " " + addressData.lastname;
      contact += " born at " + new Date(addressData.birthday);
      alert(contact);
    }

    printContact(address);

It is worth to do the additional work and write an accessor class, which encapsulates each access to the underlaying JSON data. An accessor could look like the following in qooxdoo:

    qx.Class.define("Address",
    {
      extend : qx.core.Object,
      construct : function(data) {
        this._data = data;
      },

      members :
      {
        getFirstName : function() { return this._data.firstname },
        getMiddleName : function() { return this._data.middlename || ""},
        getLastName : function() { return this._data.lastname },
        getBirthday : function() { return new Date(this._data.birthday) },
        getName : function() {
          var name = this._data.firstname;
          if (this._data.middlename) {
            name += " " + this._data.middlename;
          }      
          name += " " + this._data.lastname;
          return name;
        },
      }
    });

    function printContact(address) {
      var contact = address.getName() + " " + address.getBirthday();
      alert(contact);
    }

    printContact(new Address(address));

Reasons not to pass around JSON are:

-   **Validation**: It is easy to check, whether a variable is an instance of a given class, but hard to check whether a certain map (Object) has all the required keys.
-   **Documentation**: It is hard to get an overview of the keys supported in a JSON data structure, while classes can have a clear interface definition and (hopefully) API documentation
-   **Information Hiding**: A wrapper class can hide changes of the backend data from the rest of the code.
-   **Extensibility**: Additional helper methods can easily be added to the wrapper classes e.g. see `getName()` in the example above.
-   **Data Adaptation**: It is possible to convert data types like in `getBirthday()`, or to provide sensible default values for optional fields like in `getMiddleName()`.
-   **Type Safety**: Direct access to keys of JavaScript maps (Objects) is dangerous. If the key is missing or misspelled `undefined` will be returned, which can lead to subtle or undetected errors. If on the other hand a getter function name is misspelled the interpreter will immediately raise an exception, which makes it much easier to spot the error.

Data Transfer
-------------

Especially for the application's initial startup it is important to minimize the byte-size of transferred data and also to reduce the number of HTTP requests.

-   **Minimize**: Use a tool, which only includes the used classes, combine all files and minimize the resulting JavaScript. All of this is handled by the qooxdoo build system automatically. Make sure to enable the "variable optimization" to shorten variable names.
-   **Compress**: If possible use gzip compression to send the data to the client. This is possible for all modern browsers and definitely a lot better than other often seen solutions (e.g. decompressing code using string operations and `eval` statements on client-side).
-   **Combine**: Browsers limit the maximum number of concurrent HTTP requests to about 2-4. In combination with the network latency this is the reason, why it is always better to transfer few large files than many small ones. In addition to JavaScript files, CSS files (while usually not needed for qooxdoo applications) and images can be combined as well. Support for combining images (aka "image clipping") is planned for qooxdoo 0.8.
-   **Cache**: Configure the server to send proper HTTP cache headers so static content like JavaScript, CSS or images are cached by the client.
-   **Images**: Image sizes can often be reduced by choosing the file format that corresponds best to the image content and tweaking the compression options. Also tools like [pngcruch](http://en.wikipedia.org/wiki/Pngcrush) or [optipng](http://optipng.sourceforge.net/) could be helpful. Also be sure to avoid redundant images.

