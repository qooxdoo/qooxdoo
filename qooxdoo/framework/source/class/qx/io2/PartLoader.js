/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * This class has been moved to {@link qx.io.PartLoader}
 *
 * @deprecated This class has been moved to 'qx.io.PartLoader'
 */
qx.Class.define("qx.io2.PartLoader",
{
  extend : qx.core.Object,

  statics :
  {
    /**
     * Loads one or more parts asynchronously. The callback is called after all
     * parts and their dependencies are fully loaded. If the parts are already
     * loaded the callback is called immediately.
     *
     * @param partNames {String[]} List of parts namesto load as defined in the
     *    config file at compile time.
     * @param callback {Function} Function to execute on completion
     * @param self {Object?window} Context to execute the given function in
     * 
     * @deprecated Use 'qx.io.PartLoader.require' instead.
     */
    require : function(partNames, callback, self)
    {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "Use 'qx.io.PartLoader.require' instead."
      );      
      
      qx.io.PartLoader.getInstance().require(partNames, callback, self);
    },
    
    /**
     * Returns a singleton instance of this class. On the first call the class
     * is instantiated by calling the constructor with no arguments. All 
     * following calls will return this instance.
     * 
     * @return {qx.io2.PartLoader} The singleton instance of this class.
     * 
     * @deprecated Use 'qx.io.PartLoader.getInstance' instead.
     */
    getInstance : function()
    {
      qx.log.Logger.deprecatedClassWarning(
        qx.io2.PartLoader,
        "This class has been moved to 'qx.io.PartLoader'"
      );
      
      return qx.io.PartLoader.getInstance();     
    }
  }
});
