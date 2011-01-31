/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Mixin responsible for setting the background color of a widget.
 */
qx.Mixin.define("qx.ui.decoration.MBackgroundColor", 
{
  properties : 
  {
    /** Color of the background */
    backgroundColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyBackgroundColor"
    }    
  },


  members :
  {
    _tintBackgroundColor : function(element, bgcolor, styles) {
      var Color = qx.theme.manager.Color.getInstance();

      if (bgcolor == null) {
        bgcolor = this.getBackgroundColor();
      }

      styles.backgroundColor = Color.resolve(bgcolor) || "";
    },

    
    _resizeBackgroundColor : function(element, width, height) {
      var insets = this.getInsets();
      width -= insets.left + insets.right;
      height -= insets.top + insets.bottom;

      // Fix to keep applied size above zero
      // Makes issues in IE7 when applying value like '-4px'
      if (width < 0) {
        width = 0;
      }

      if (height < 0) {
        height = 0;
      }

      element.style.width = width + "px";
      element.style.height = height + "px";

      element.style.left =
        (parseInt(element.style.left, 10)) + insets.left;
      element.style.top =
        (parseInt(element.style.top, 10)) + insets.top;      
    },


    // property apply
    _applyBackgroundColor : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    }
  }
});
