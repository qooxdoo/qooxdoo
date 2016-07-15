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

************************************************************************ */
/**
 * Mixin for supporting the background images on decorators.
 * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
 *
 * It is possible to define multiple background images by setting an
 * array containing the needed values as the property value.
 * In case multiple values are specified, the values of the properties
 * are repeated until all match in length.
 *
 * An example:
 * <pre class="javascript">
 *   'my-decorator': {
 *     style: {
 *       backgroundImage: ['foo1.png', 'foo2.png', 'bar1.png', 'bar2.png'],
 *       backgroundRepeat: 'no-repeat',
 *       backgroundPositionX: ['left', 'right', 'center'],
 *       backgroundPositionY: ['center', 'top']
 *     }
 *   }
 * </pre>
 * which is the same as:
 * <pre class="javascript">
 *   'my-decorator': {
 *     style: {
 *       backgroundImage: ['foo1.png', 'foo2.png', 'bar1.png', 'bar2.png'],
 *       backgroundRepeat: ['no-repeat', 'no-repeat', 'no-repeat', 'no-repeat'],
 *       backgroundPositionX: ['left', 'right', 'center', 'left'],
 *       backgroundPositionY: ['center', 'top', 'center', 'top']
 *     }
 *   }
 * </pre>
 */
qx.Mixin.define("qx.ui.decoration.MBackgroundImage",
{
  properties :
  {
    /** The URL of the background image */
    backgroundImage :
    {
      nullable : true,
      apply : "_applyBackgroundImage"
    },


    /** How the background image should be repeated */
    backgroundRepeat :
    {
      init : "repeat",
      apply : "_applyBackgroundImage"
    },


    /**
     * Either a string or a number, which defines the horizontal position
     * of the background image.
     *
     * If the value is an integer it is interpreted as a pixel value, otherwise
     * the value is taken to be a CSS value. For CSS, the values are "center",
     * "left" and "right".
     */
    backgroundPositionX :
    {
      nullable : true,
      apply : "_applyBackgroundPosition"
    },


    /**
     * Either a string or a number, which defines the vertical position
     * of the background image.
     *
     * If the value is an integer it is interpreted as a pixel value, otherwise
     * the value is taken to be a CSS value. For CSS, the values are "top",
     * "center" and "bottom".
     */
    backgroundPositionY :
    {
      nullable : true,
      apply : "_applyBackgroundPosition"
    },


    /**
     * Specifies where the background image is positioned.
     */
    backgroundOrigin :
    {
      nullable: true,
      apply: "_applyBackgroundImage"
    },


    /**
     * Property group to define the background position
     */
    backgroundPosition :
    {
      group : ["backgroundPositionY", "backgroundPositionX"]
    },


    /**
     * Whether to order gradients before Image-URL-based background declarations
     * if both qx.ui.decoration.MBackgroundImage and
     * qx.ui.decoration.MLinearBackgroundGradient decorations are used.
     */
    orderGradientsFront :
    {
      check: 'Boolean',
      init: false
    }
  },


  members :
  {
    /**
     * Adds the background-image styles to the given map
     * @param styles {Map} CSS style map
     */
    _styleBackgroundImage : function(styles)
    {
      if(! this.getBackgroundImage()) {
        return;
      }

      if("background" in styles) {
        if(!qx.lang.Type.isArray(styles['background'])) {
          styles['background'] = [styles['background']];
        }
      } else {
        styles['background'] = [];
      }

      var backgroundImageProperties = ['backgroundImage', 'backgroundRepeat', 'backgroundPositionY',
        'backgroundPositionX', 'backgroundOrigin'];

      (function (images, repeats, tops, lefts, origins) {
        for(var i=0;i<images.length;i++) {
          var image = images[i];
          var repeat = repeats[i];
          var top = tops[i] || 0;
          var left = lefts[i] || 0;
          var origin = origins[i] || '';

          if (top == null) {
            top = 0;
          }
          if (left == null) {
            left = 0;
          }
          if (!isNaN(top)) {
            top += "px";
          }
          if (!isNaN(left)) {
            left += "px";
          }

          var id = qx.util.AliasManager.getInstance().resolve(image);
          var source = qx.util.ResourceManager.getInstance().toUri(id);

          var attrs = {
            image: 'url(' + source + ')',
            position: left + " " + top,
            repeat: 'repeat',
            origin: origin
          };
          if (repeat === "scale") {
            attrs.size = "100% 100%";
          } else {
            attrs.repeat = repeat;
          }
          var imageMarkup = [attrs.image, attrs.position + ('size' in attrs ? ' / ' + attrs.size : ''), attrs.repeat, attrs.origin];

          styles["background"][this.getOrderGradientsFront() ? 'push' : 'unshift'](imageMarkup.join(' '));

          if (qx.core.Environment.get("qx.debug") &&
            source &&  source.endsWith(".png") &&
            (repeat == "scale" || repeat == "no-repeat") &&
            qx.core.Environment.get("engine.name") == "mshtml" &&
            qx.core.Environment.get("browser.documentmode") < 9)
          {
            this.warn("Background PNGs with repeat == 'scale' or repeat == 'no-repeat'" +
              " are not supported in this client! The image's resource id is '" + id + "'");
          }
        }
      }).apply(this, this._getExtendedPropertyValueArrays(backgroundImageProperties));
    },


    // property apply
    _applyBackgroundImage : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    },


    // property apply
    _applyBackgroundPosition : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
        if (qx.core.Environment.get("engine.name") == "mshtml" &&
          qx.core.Environment.get("browser.documentmode") < 9)
        {
          this.warn("The backgroundPosition property is not supported by this client!");
        }
      }
    }
  }
});
