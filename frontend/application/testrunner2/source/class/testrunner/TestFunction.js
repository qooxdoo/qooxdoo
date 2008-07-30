/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("testrunner.TestFunction",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param clazz {Class?null}
   * @param methodName {String?null}
   * @param testFunction {Function?null}
   */
  construct : function(clazz, methodName, testFunction)
  {
    if (testFunction) {
      this.setTestFunction(testFunction);
    }
    else
    {
      this.setTestFunction(function()
      {
        var cls = new clazz;

        if (typeof (cls.setUp) == "function") {
          cls.setUp();
        }

        try {
            cls[methodName]();
        } catch (e) {
            throw e;
        } finally {
            // tearDown should always be called.
            if (typeof (cls.tearDown) == "function") {
              cls.tearDown();
            }
        }

      });
    }

    if (clazz) {
      this.setClassName(clazz.classname);
    }

    this.setName(methodName);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    testFunction : { check : "Function" },
    name : { check : "String" },

    className :
    {
      check : "String",
      init  : ""
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param testResult {var} TODOC
     * @return {void}
     */
    run : function(testResult) {
      testResult.run(this, this.getTestFunction());
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getFullName : function() {
      return [ this.getClassName(), this.getName() ].join(":");
    }
  }
});
