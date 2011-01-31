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
 * Mixin for the linear background gradient CSS property.
 * 
 * Keep in mind that this is not supported by all browsers:
 *   * Safari 4.0+
 *   * Chrome 4.0+
 */
qx.Mixin.define("qx.ui.decoration.MLinearBackgroundGradient", 
{
  properties : 
  {
    /** Start color of the background */
    startColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },
    
    /** End color of the background */
    endColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },
    
    /** Property group to set the colors. */
    gradientColor :
    {
      group : ["startColor", "endColor"],
      mode : "shorthand"
    },
    
    /** Horizontal start position in percent of the gradient. */
    startPosHorizontal :
    {
      check : "Number",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },
    
    /** Vertical start position in percent of the gradient. */
    startPosVertical :
    {
      check : "Number",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },
    
    /** Horizontal end position in percent of the gradient. */
    endPosHorizontal :
    {
      check : "Number",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },
    
    /** Vertical end position in percent of the gradient. */
    endPosVertical :
    {
      check : "Number",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },
    
    /** Position of the gradient in percent. */
    gradientPosition :
    {
      group : ["startPosHorizontal", "startPosVertical", "endPosHorizontal", "endPosVertical"],
      mode : "shorthand"
    }
  },


  members :
  {
    _getMarkupLinearBackgroundGradient : function(styles) {
      
      var startPos = 
        (this.getStartPosHorizontal() || 0) + "% " + (this.getStartPosVertical() || 0) + "%";
      var endPos = 
        (this.getEndPosHorizontal() || 0) + "% " + (this.getEndPosVertical() || 0) + "%";
      var color = "from(" + this.getStartColor() + "), to(" + this.getEndColor() + ")";
      var value = "-webkit-gradient(linear," + startPos + "," + endPos + "," + color + ")";
      
      styles["background"] = value;      
    },


    // property apply
    _applyLinearBackgroundGradient : function()
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
