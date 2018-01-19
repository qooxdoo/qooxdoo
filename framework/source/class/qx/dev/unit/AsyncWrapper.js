/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 *  This class stores the information needed to instruct a running test to wait.
 *  It is thrown as an exception to be caught by the method executing the test.
 */
qx.Class.define("qx.dev.unit.AsyncWrapper",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param delay {Integer?} The amount of time in milliseconds to wait
   * @param deferredFunction {Function?} The function to run after the timeout
   * has expired.
   * @param context {Object?window} Optional execution context for deferredFunction
   */
  construct : function(delay, deferredFunction, context)
  {
    for (var i=0; i<2; i++) {
      if (qx.lang.Type.isFunction(arguments[i])) {
        this.setDeferredFunction(arguments[i]);
      } else if (qx.lang.Type.isNumber(arguments[i])) {
        if (qx.core.Environment.get("qx.test.delay.scale")) {
          this.setDelay(arguments[i] * parseInt(qx.core.Environment.get("qx.test.delay.scale"), 10));
        } else {
          this.setDelay(arguments[i]);
        }
      }
    }

    if (context) {
      this.setContext(context);
    }
  },

  properties :
  {
    /** The function to run after the timeout has expired */
    deferredFunction :
    {
      check : "Function",
      init : false
    },

    /** The context in which the timeout function should be executed  */
    context :
    {
      check : "Object",
      init : null
    },

    /** The amount of time in milliseconds to wait */
    delay :
    {
      check: "Integer",
      nullable : false,
      init : 10000
    }
  }

});
