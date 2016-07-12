/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * This class acts as abstract class for all decorators. It offers the
 * properties for the insets handling. Each decorator has to define its own
 * default insets by implementing the template method
 * (http://en.wikipedia.org/wiki/Template_Method) <code>_getDefaultInsets</code>
 */
qx.Class.define("qx.ui.decoration.Abstract",
{
  extend: qx.core.Object,
  implement : [qx.ui.decoration.IDecorator],
  type: "abstract",


  members :
  {
    __insets : null,


    /**
     * Abstract method. Should return a map containing the default insets of
     * the decorator. This could look like this:
     * <pre>
     * return {
     *   top : 0,
     *   right : 0,
     *   bottom : 0,
     *   left : 0
     * };
     * </pre>
     * @return {Map} Map containing the insets.
     */
    _getDefaultInsets : function() {
      throw new Error("Abstract method called.");
    },


    /**
     * Abstract method. Should return an boolean value if the decorator is
     * already initialized or not.
     * @return {Boolean} True, if the decorator is initialized.
     */
    _isInitialized: function() {
      throw new Error("Abstract method called.");
    },


    /**
     * Resets the insets.
     */
    _resetInsets: function() {
      this.__insets = null;
    },


    // interface implementation
    getInsets : function()
    {
      if (!this.__insets) {
        this.__insets = this._getDefaultInsets();
      }

      return this.__insets;
    }
  },


  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this.__insets = null;
   }
});
