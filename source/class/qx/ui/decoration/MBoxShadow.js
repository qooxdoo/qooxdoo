/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
 *
 * It is possible to define multiple box shadows by setting an 
 * array containing the needed values as the property value.
 * In case multiple values are specified, the values of the properties
 * are repeated until all match in length.
 *
 * An example:
 * <pre class="javascript">
 *   'my-decorator': {
 *     style: {
 *       shadowBlurRadius: 2,
 *       shadowVerticalLength: 1,
 *       shadowColor: ['rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.4)'],
 *       inset: [true, false]
 *     }
 *   }
 * </pre>
 * which is the same as:
 * <pre class="javascript">
 *   'my-decorator': {
 *     style: {
 *       shadowBlurRadius: [2, 2],
 *       shadowVerticalLength: [1, 1],
 *       shadowColor: ['rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.4)'],
 *       inset: [true, false]
 *     }
 *   }
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

      var Color = null;
      if(qx.core.Environment.get("qx.theme")) {
        Color = qx.theme.manager.Color.getInstance();
      }

      var boxShadowProperties = ["shadowVerticalLength", "shadowHorizontalLength", "shadowBlurRadius",
        "shadowSpreadRadius", "shadowColor", "inset"];
        
      (function(vLengths, hLengths, blurs, spreads, colors, insets) {
        for(var i=0;i<vLengths.length;i++) {
          var vLength = vLengths[i] || 0;
          var hLength = hLengths[i] || 0;
          var blur = blurs[i] || 0;
          var spread = spreads[i] || 0;
          var color = colors[i] || "black";
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
      }).apply(this, this._getExtendedPropertyValueArrays(boxShadowProperties));
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
