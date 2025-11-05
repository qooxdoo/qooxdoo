/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Test class for issue 10693 - Property accessor metadata generation
 */
qx.Class.define("testapp.Issue10693", {
  extend: qx.core.Object,

  properties: {
    /**
     * A string property
     */
    myString: {
      check: "String",
      init: "default"
    },

    /**
     * A boolean property
     */
    myBoolean: {
      check: "Boolean",
      init: false
    },

    /**
     * A number property
     */
    myNumber: {
      check: "Number",
      init: 0
    },

    /**
     * An async property
     */
    myAsync: {
      check: "String",
      init: null,
      nullable: true,
      async: true
    }
  },

  members: {
    // Explicitly defined method to ensure it's not overwritten
    customMethod() {
      return "custom";
    }
  }
});
