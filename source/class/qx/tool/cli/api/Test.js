/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Henner Kollmann

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project"s top-level directory for details.
************************************************************************ */
/**
 * This is used to add an test case for qx test
 */
qx.Class.define("qx.tool.cli.api.Test", {
  extend: qx.core.Object,
  construct(name, testFunction) {
    super();
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
     * If this special test fails exit process
     */
    failFast: {
      check: "Boolean",
      nullable: false,
      init: false
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
    execute() {
      let f = this.getTestFunction();
      return qx.Promise.resolve(f.call(this, this));
    }
  }
});
