/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)
#optional(qx.log.Logger)

************************************************************************ */

/**
 * The logging interface.
 *
 * Convenience functions to use the logging system of qooxdoo.
 */
qx.Mixin.define("qx.log.MLogging",
{
  members:
  {
    /**
     * Returns the logger of this class.
     *
     * @type member
     * @return {qx.log.Logger} the logger of this class.
     */
    getLogger : function()
    {
      if (qx.log.Logger) {
        return qx.log.Logger.getClassLogger(this.constructor);
      }

      throw new Error("To enable logging please include qx.log.Logger into your build!");
    },

    /**
     * Logs a debug message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *          object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    debug : function(msg, exc) {
      this.getLogger().debug(msg, this.toHashCode(), exc);
    },

    /**
     * Logs an info message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    info : function(msg, exc) {
      this.getLogger().info(msg, this.toHashCode(), exc);
    },

    /**
     * Logs a warning message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    warn : function(msg, exc) {
      this.getLogger().warn(msg, this.toHashCode(), exc);
    },

    /**
     * Logs an error message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    error : function(msg, exc) {
      this.getLogger().error(msg, this.toHashCode(), exc);
    },

    /**
     * Logs the current stack trace as a debug message.
     *
     * @type member
     * @return {void}
     */
    printStackTrace : function()
    {
      this.getLogger().printStackTrace();
    }
  }
});
