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
 * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
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
      apply : "_applyBoxShadow"
    },

    /** Vertical length of the shadow. */
    shadowVerticalLength :
    {
      nullable : true,
      apply : "_applyBoxShadow"
    },

    /** The blur radius of the shadow. */
    shadowBlurRadius :
    {
      nullable : true,
      apply : "_applyBoxShadow"
    },

    /** The spread radius of the shadow. */
    shadowSpreadRadius :
    {
      nullable : true,
      apply : "_applyBoxShadow"
    },

    /** The color of the shadow. */
    shadowColor :
    {
      nullable : true,
      apply : "_applyBoxShadow"
    },

    /** Inset shadows are drawn inside the border. */
    inset :
    {
      init : false,
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
     * {@link qx.ui.decoration.Decorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleBoxShadow : function(styles) {
      var propName = qx.core.Environment.get("css.boxshadow");
      if (!propName ||
          this.getShadowVerticalLength() == null &&
          this.getShadowHorizontalLength() == null)
      {
        return;
      }

      propName = qx.bom.Style.getCssName(propName);

      // transform non-array values to an array containing that value
      var vLengths = this.getShadowVerticalLength() || [0];
      if(!qx.lang.Type.isArray(vLengths)) vLengths = [vLengths];
      var hLengths = this.getShadowHorizontalLength() || [0];
      if(!qx.lang.Type.isArray(hLengths)) hLengths = [hLengths];
      var blurs = this.getShadowBlurRadius() || [0];
      if(!qx.lang.Type.isArray(blurs)) blurs = [blurs];
      var spreads = this.getShadowSpreadRadius() || [0];
      if(!qx.lang.Type.isArray(spreads)) spreads = [spreads];
      var colors = this.getShadowColor() || ["black"];
      if(!qx.lang.Type.isArray(colors)) colors = [colors];
      var insets = this.getInset();
      if(!qx.lang.Type.isArray(insets)) insets = [!!insets];

      // Because it's possible to set multiple values for a property there's 
      // a chance that not all properties have the same amount of values set.
      // Prolong the value arrays by repeating existing values until all
      // arrays match in length.
      var items = Math.max(vLengths.length, hLengths.length, blurs.length, spreads.length, colors.length, insets.length);
      this._prolongArray(vLengths, items);
      this._prolongArray(hLengths, items);
      this._prolongArray(blurs, items);
      this._prolongArray(spreads, items);
      this._prolongArray(colors, items);
      this._prolongArray(insets, items);

      var Color = null;
      if(qx.core.Environment.get("qx.theme")) {
        Color = qx.theme.manager.Color.getInstance();
      }

      for(var i=0;i<items;i++) {
        var vLength = vLengths[i];
        var hLength = hLengths[i];
        var blur = blurs[i];
        var spread = spreads[i];
        var color = colors[i];
        var inset = insets[i];

        if(Color) {
          color = Color.resolve(color);
        }

        if(color != null) {
          var value = (inset ? 'inset ' : '') + hLength + "px " + vLength + "px " + blur + "px " + spread + "px " + color;
          // apply or append the box shadow styles
          if (!styles[propName]) {
            styles[propName] = value;
          } else {
            styles[propName] += "," + value;
          }
        }
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
