/**
 * This is used to add an test case for qx test
 */
qx.Class.define("qx.tool.cli.api.Test", {
  extend: qx.core.Object,
  construct: function(name, testFunction) {
    this.base(arguments);
    this.setName(name);
    if (testFunction) {
      this.setTestFunction(testFunction);
    }
  },
  properties: {
    /**
     * Name of the process
     */
    name: {
      check: "String"
    },
    /**
     * A description of the test. 
     * For documentation purpose
     */
    description: {
      check: "String",
      event: "changeDescription"
    },
    /**
     * The exit code of the test.
     *
     */
    exitCode: {
      check: "Number",
      event: "changeExitCode",
      nullable: true,
      init: null
    },
    /**
     * Is the webserver instance needed for this test?
     */
    needsServer: {
      check: "Boolean",
      nullable: false,
      init: true
    },
    /**
     * The test function called by qx test
     * 
     */
    testFunction: {
      check: "Function",
      nullable: false,
      init: () => {}
    }
  },


  members: {
    /**
     * Execute the test
     * 
     * @returns: Promise
     * 
     * Can be overriden
     */
    execute: function() {
      let f = this.getTestFunction(); 
      return qx.Promise.resolve(f.call(this, this));
    }
  }
});
