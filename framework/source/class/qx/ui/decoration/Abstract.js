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
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/**
 * This class acts as abstract class for all decorators. It offers the
 * properties for the insets handling. Every decorator has to define its own
 * default insets by implementing the template method
 * (http://en.wikipedia.org/wiki/Template_Method) <code>_getDefaultInsets</code>
 * . Another template method called <code>_isInitialized</code> should return
 * weather the decorator is initialized of not.
 */
qx.Class.define("qx.ui.decoration.Abstract",
{
  extend: qx.core.Object,
  implement : [qx.ui.decoration.IDecorator],
  type: "abstract",

  properties :
  {
    /** Width of the left inset (keep this margin to the outer box) */
    insetLeft :
    {
      check : "Number",
      nullable: true,
      apply : "_applyInsets"
    },

    /** Width of the right inset (keep this margin to the outer box) */
    insetRight :
    {
      check : "Number",
      nullable: true,
      apply : "_applyInsets"
    },

    /** Width of the bottom inset (keep this margin to the outer box) */
    insetBottom :
    {
      check : "Number",
      nullable: true,
      apply : "_applyInsets"
    },

    /** Width of the top inset (keep this margin to the outer box) */
    insetTop :
    {
      check : "Number",
      nullable: true,
      apply : "_applyInsets"
    },

    /** Property group for insets */
    insets :
    {
      group : [ "insetTop", "insetRight", "insetBottom", "insetLeft" ],
      mode  : "shorthand"
    }
  },


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
      if (this.__insets) {
        return this.__insets;
      }

      var defaults = this._getDefaultInsets();

      return this.__insets =
      {
        left : this.getInsetLeft() == null ? defaults.left : this.getInsetLeft(),
        right : this.getInsetRight() == null ? defaults.right : this.getInsetRight(),
        bottom : this.getInsetBottom() == null ? defaults.bottom : this.getInsetBottom(),
        top : this.getInsetTop() == null ? defaults.top : this.getInsetTop()
      };
    },


    // property apply
    _applyInsets : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }

      this.__insets = null;
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
