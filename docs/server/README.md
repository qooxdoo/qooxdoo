Server Overview
===============

This page is an overview of %{qooxdoo}'s server capabilities. It shows which parts of %{qooxdoo} can be used in a server environment or comparable scenario. It also serves as an introduction to all interested in using %{qooxdoo} on a %{JS} server environment.

Included Features
-----------------

This listing shows the core features of the *%{qooxdoo} %{Server}* package. If you build your own package with the skeleton way of using %{qooxdoo}, the feature set might be extended depending on your application code.

-   Object Orientation \<core/oo\_introduction\>

    -   Classes \<core/classes\>
    -   Mixins \<core/mixins\>
    -   Interfaces \<core/interfaces\>
    -   Properties \<core/understanding\_properties\>

    \* Annotations \<core/annotations\>
-   Events \<desktop/event\_layer\_impl\>
-   Single Value Binding \<data\_binding/single\_value\_binding\>

Most of the features can be found in %{qooxdoo}'s core layer and should be familiar to %{qooxdoo} developers.

Supported Runtimes
------------------

We currently support two types of runtimes:

-   [node.js](http://nodejs.org/)
-   [Rhino](http://www.mozilla.org/rhino/)

Installation
------------

See Requirements \<requirements\> for details on how to obtain and install %{qooxdoo} %{Server}.

Basic Example
-------------

The following example shows how to use the *%{qooxdoo} %{Server}* package in a node environment, having installed the package via npm.

    var qx = require('%{qooxdoo}');

    // create anmial class
    qx.Class.define("my.Animal", {
      extend : qx.core.Object,
      properties : {
        legs : {init: 4}
      }
    });

    // create dog class
    qx.Class.define("my.Dog", {
      extend : my.Animal,
      members : {
        bark : function() {
          console.log("ARF! I have " + this.getLegs() + " legs!");
        }
      }
    });

    var dog = new my.Dog();
    dog.bark();

Only two lines in this example are specific to the server environment: The first one, where you include the %{qooxdoo} package and the implementation of the `bark` function, which uses node's `console` object. To run the example in Rhino, simply change the first line to something like this:

>     load(["path/to/qx-oo-%{version}.js"]);

and replace `console.log` with `print`.

The rest of the code is plain %{qooxdoo}-style %{JS} which can be run in a browser, too. For more information on that topic, take a look at the documentation about Object Orientation \<core/oo\_introduction\>.

Additional Scenarios
--------------------

The *%{qooxdoo} %{Server}* package does not contain any server-dependent code so it can also be used in a browser e.g. to have the features described above without the need to use the rest of %{qooxdoo}. Another interesting scenario might be to use the package in a [web worker](https://developer.mozilla.org/en/Using_web_workers), which is also a DOM-less environment.
