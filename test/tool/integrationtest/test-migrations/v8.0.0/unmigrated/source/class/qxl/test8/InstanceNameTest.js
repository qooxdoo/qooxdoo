qx.Class.define("qxl.test8.InstanceNameTest", {
  extend: qx.core.Object,

  construct() {
    super();

    // This file contains multiple .name usages on instances that should be detected

    // Usage 1: this.name (most common pattern in old code)
    var className = this.name;

    // Usage 2: Console log with this.name
    console.log("Class name:", this.name);

    // Usage 3: Conditional with this.name
    if (this.name === "qxl.test8.InstanceNameTest") {
      this.debug("Found test class");
    }
  },

  members: {
    getDebugLabel() {
      // Usage 4: this.name in return statement
      return "Debug: " + this.name;
    },

    processWidget(widget) {
      // Usage 5: .name on a parameter (common variable name)
      console.log("Processing widget:", widget.name);

      var obj = new qx.core.Object();

      // Usage 6: obj.name (common variable name)
      var objName = obj.name;

      // Usage 7: element.name
      var element = this.getChildControl("button");
      return element.name;
    },

    handleInstance(instance) {
      // Usage 8: instance.name (literal variable name "instance")
      if (instance.name) {
        this.info("Instance:", instance.name);
      }
    }
  }
});
