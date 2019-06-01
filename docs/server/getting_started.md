Getting Started with %{qooxdoo} %{Server}
=========================================

On the basic level, you can just load the %{Server} module into your own program, using your runtime's loading primitives. Here is a simple example for Node.js:

    var qx = require('%{qooxdoo}');

    qx.Class.define("Dog", {
      extend : qx.core.Object,
      members : {
        bark : function() {
          console.log("Ruff!");
        }
      }
    });

    var dog = new Dog();
    dog.bark();
