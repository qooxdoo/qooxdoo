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
 * This mixin is usually used by {@link qx.ui.decoration.DynamicDecorator}.
 * 
 * Keep in mind that this is not supported by all browsers:
 *
 * * Safari 4.0+
 * * Chrome 4.0+
 * * Firefox 3.6+
 */
qx.Mixin.define("qx.ui.decoration.MLinearBackgroundGradient", 
{
  properties : 
  {
    /** Start start color of the background */
    startColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },
    
    /** End end color of the background */
    endColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },
    
    /** The orientation of the gradient. */
    orientation : 
    {
      check : ["horizontal", "vertical"],
      init : "vertical",
      apply : "_applyLinearBackgroundGradient"
    },
    
    /** Position in percent where to start the color. */
    startColorPosition : 
    {
      check : "Number", 
      init : 0,
      apply : "_applyLinearBackgroundGradient"
    },
    
    /** Position in percent where to start the color. */
    endColorPosition : 
    {
      check : "Number", 
      init : 100,
      apply : "_applyLinearBackgroundGradient"
    },
    
    
    /** Property group to set the start color inluding its start position. */
    gradientStart :
    {
      group : ["startColor", "startColorPosition"],
      mode : "shorthand"
    },
    
    /** Property group to set the end color inluding its end position. */
    gradientEnd :
    {
      group : ["endColor", "endColorPosition"],
      mode : "shorthand"
    }
  },


  members :
  {
    /**
     * Takes a styles map and adds the linear background styles in place to the 
     * given map. This is the needed behavior for 
     * {@link qx.ui.decoration.DynamicDecorator}.
     * 
     * @param styles {Map} A map to add the styles.
     */
    _getMarkupLinearBackgroundGradient : function(styles) {
      var Color = qx.theme.manager.Color.getInstance();

      if (qx.bom.client.Engine.WEBKIT) {
        
        if (this.getOrientation() == "horizontal") {
          var startPos = this.getStartColorPosition() + "% 0%";
          var endPos = this.getEndColorPosition() + "% 0%";
        } else {
          var startPos = "0% " + this.getStartColorPosition() + "%";
          var endPos = "0% " + this.getEndColorPosition() + "%";
        }

        var color = 
          "from(" + Color.resolve(this.getStartColor()) + 
          "), to(" + Color.resolve(this.getEndColor()) + ")";

        var value = "-webkit-gradient(linear," + startPos + "," + endPos + "," + color + ")";
        styles["background"] = value;

      } else {
        var deg = this.getOrientation() == "horizontal" ? 0 : 270;
        var start = Color.resolve(this.getStartColor()) + " " + this.getStartColorPosition() + "%";
        var end = Color.resolve(this.getEndColor()) + " " + this.getEndColorPosition() + "%";

        var prefix = qx.bom.client.Engine.GECKO ? "-moz-" : "";
        styles["background"] = 
          prefix + "linear-gradient(" + deg + "deg, " + start + "," + end + ")";
      }
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
