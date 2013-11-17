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

************************************************************************ */
/**
 * Mixin for supporting the background images on decorators.
 * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
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
     * Property group to define the background position
     */
    backgroundPosition :
    {
      group : ["backgroundPositionY", "backgroundPositionX"]
    },


    /**
     * Property group to define the background position
     */
    backgroundOrigin :
    {
      nullable : true,
      apply : "_applyBackgroundImage"
    },

    /**
     * Whether to order gradients before Image-URL-based background declarations if both qx.ui.decoration.MBackgroundImage and qx.ui.decoration.MLinearBackgroundGradient decorations are used.
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
      var images = this.getBackgroundImage();
      if(!images) { return; }
      if(!qx.lang.Type.isArray(images)) images = [images];
      var repeats = this.getBackgroundRepeat();
      if(!qx.lang.Type.isArray(repeats)) repeats = [repeats];
      var tops = this.getBackgroundPositionY();
      if(!qx.lang.Type.isArray(tops)) tops = [tops];
      var lefts = this.getBackgroundPositionX();
      if(!qx.lang.Type.isArray(lefts)) lefts = [lefts];
      var origins = this.getBackgroundOrigin();
      if(!qx.lang.Type.isArray(origins)) origins = [origins];

      var items = Math.max(images.length, repeats.length, tops.length, lefts.length);
      qx.lang.Array.prolong(images, items);
      qx.lang.Array.prolong(repeats, items);
      qx.lang.Array.prolong(tops, items);
      qx.lang.Array.prolong(lefts, items);
      qx.lang.Array.prolong(origins, items);

      if("background" in styles) {
        if(!Array.isArray(styles['background'])) {
          styles['background'] = [styles['background']];
        }
      } else {
        styles['background'] = [];
      }

      for(var i=0;i<items;i++) {
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
          source &&  qx.lang.String.endsWith(source, ".png") &&
          (repeat == "scale" || repeat == "no-repeat") &&
          qx.core.Environment.get("engine.name") == "mshtml" &&
          qx.core.Environment.get("browser.documentmode") < 9)
        {
          this.warn("Background PNGs with repeat == 'scale' or repeat == 'no-repeat'" +
            " are not supported in this client! The image's resource id is '" + id + "'");
        }
      }
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
