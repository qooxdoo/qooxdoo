qx.Class.define("qxl.test8.NoInstanceNameTest", {
  extend: qx.core.Object,

  properties: {
    // Having a property named "name" is OK in v8
    // (that's why the .name field was removed - to avoid conflict)
    name: {
      check: "String",
      init: "default"
    }
  },

  construct() {
    super();

    // This file uses the CORRECT patterns
    // It should NOT trigger any .name field warnings

    // Correct: Use this.classname instead of this.name
    var className = this.classname;

    // Correct: Console log with classname
    console.log("Class name:", this.classname);

    // Correct: Conditional with classname
    if (this.classname === "qxl.test8.NoInstanceNameTest") {
      this.debug("Found test class");
    }
  },

  members: {
    getDebugLabel() {
      // Correct: Use classname
      return "Debug: " + this.classname;
    },

    processWidget(widget) {
      // Correct: Use classname
      console.log("Processing widget:", widget.classname);

      // Correct: Access the property getter (not the old .name field)
      var myName = this.getName(); // This is the getter for the "name" property

      // These should NOT be detected (built-in objects, not qooxdoo instances):
      var funcName = Function.name;
      var errName = Error.name;
      var winName = window.name;
    },

    handleInstance(inst) {
      // Correct: Use classname on instances
      if (inst.classname) {
        this.info("Instance:", inst.classname);
      }
    }
  }
});
