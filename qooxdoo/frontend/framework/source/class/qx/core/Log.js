/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Wrapper around the logging environment at qx.log2.*.
 */
qx.Bootstrap.define("qx.core.Log",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
      USER INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Outputs a log message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    log : function(varargs) {
      qx.log2.Logger.debug.apply(qx.log2.Logger, arguments);
    },


    /**
     * Outputs a debug message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    debug : function(varargs) {
      qx.log2.Logger.debug.apply(qx.log2.Logger, arguments);
    },


    /**
     * Outputs an info message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    info : function(varargs) {
      qx.log2.Logger.debug.apply(qx.log2.Logger, arguments);
    },


    /**
     * Outputs a warning message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    warn : function(varargs) {
      qx.log2.Logger.debug.apply(qx.log2.Logger, arguments);
    },


    /**
     * Outputs an error message
     *
     * @type static
     * @param varargs {arguments} One or multiple messages
     * @return {void}
     */
    error : function(varargs) {
      qx.log2.Logger.debug.apply(qx.log2.Logger, arguments);
    }
  }
});
