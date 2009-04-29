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
    
    
    _getDefaultInsets : function() {
      throw new Error("Abstract method called.");
    },
    
    
    _isInitialized: function() {
      throw new Error("Abstract method called.");
    },

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
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }

      this.__insets = null;
    }
  }
});
