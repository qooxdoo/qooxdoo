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
 * Mixin for the box shadow CSS property.
 * This mixin is usually used by {@link qx.ui.decoration.DynamicDecorator}.
 *
 * Keep in mind that this is not supported by all browsers:
 *
 * * Firefox 3,5+
 * * IE9+
 * * Safari 3.0+
 * * Opera 10.5+
 * * Chrome 4.0+
 */
qx.Mixin.define("qx.ui.decoration.MBoxShadow",
{
  properties : {
    /** Horizontal length of the shadow. */
    shadowHorizontalLength :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBoxShadow"
    },

    /** Vertical length of the shadow. */
    shadowVerticalLength :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBoxShadow"
    },

    /** The blur radius of the shadow. */
    shadowBlurRadius :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBoxShadow"
    },

    /** The spread radius of the shadow. */
    shadowSpreadRadius :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBoxShadow"
    },

    /** The color of the shadow. */
    shadowColor :
    {
      nullable : true,
      check : "Color",
      apply : "_applyBoxShadow"
    },

    /** Inset shadows are drawn inside the border. */
    inset :
    {
      init : false,
      check : "Boolean",
      apply : "_applyBoxShadow"
    },

    /** Property group to set the shadow length. */
    shadowLength :
    {
      group : ["shadowHorizontalLength", "shadowVerticalLength"],
      mode : "shorthand"
    }
  },


  members :
  {
    /**
     * Takes a styles map and adds the box shadow styles in place to the
     * given map. This is the needed behavior for
     * {@link qx.ui.decoration.DynamicDecorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleBoxShadow : function(styles) {
      if (qx.core.Environment.get("qx.theme"))
      {
        var Color = qx.theme.manager.Color.getInstance();
        var color = Color.resolve(this.getShadowColor());
      }
      else
      {
        var color = this.getShadowColor();
      }

      if (color != null)
      {
        var vLength = this.getShadowVerticalLength() || 0;
        var hLength = this.getShadowHorizontalLength() || 0;
        var blur = this.getShadowBlurRadius() || 0;
        var spread = this.getShadowSpreadRadius() || 0;
        var inset = this.getInset() ? "inset " : "";
        var value = inset + hLength + "px " + vLength + "px " + blur + "px " + spread + "px " + color;

        styles["-moz-box-shadow"] = value;
        styles["-webkit-box-shadow"] = value;
        styles["box-shadow"] = value;
      }
    },


    // property apply
    _applyBoxShadow : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    }
  }
});
