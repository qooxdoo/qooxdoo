/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Powerful creation and update features for images used for decoration
 * proposes like for rounded borders, icons, etc.
 *
 * Includes support for image clipping, PNG alpha channel support, additional
 * repeat options like <code>scale-x</code> or <code>scale-y</code>.
 */
qx.Class.define("qx.bom.element.Decoration",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Boolean} Whether clipping hints should be logged */
    DEBUG : false,


    /**
     * {Boolean} Whether the alpha image loader is needed
     * We enable this for IE7 as well because of issues reported by Maria
     * Siebert and others in combination with the opacity filter applied
     * to e.g. disabled icons. Hopefully this is better in IE8, that
     * we do not need the AlphaImageLoader anymore. Thanks Maria.
     */
    __enableAlphaFix : qx.core.Variant.isSet("qx.client", "mshtml") &&
      qx.bom.client.Engine.VERSION < 8,


    /** {Map} List of repeat modes which supports the IE AlphaImageLoader */
    __alphaFixRepeats : qx.core.Variant.select("qx.client",
    {
      "mshtml" :
      {
        "scale-x" : true,
        "scale-y" : true,
        "scale" : true,
        "no-repeat" : true
      },

      "default" : null
    }),


    /** {Map} Mapping between background repeat and the tag to create */
    __repeatToTagname :
    {
      "scale-x" : "img",
      "scale-y" : "img",
      "scale" : "img",
      "repeat" : "div",
      "no-repeat" : "div",
      "repeat-x" : "div",
      "repeat-y" : "div"
    },


    /**
     * Updates the element to display the given source
     * with the repeat option.
     *
     * @param element {Element} DOM element to update
     * @param source {String} Any valid URI
     * @param repeat {String} One of <code>scale-x</code>, <code>scale-y</code>,
     *   <code>scale</code>, <code>repeat</code>, <code>repeat-x</code>,
     *   <code>repeat-y</code>, <code>repeat</code>
     * @param style {Map} Additional styles to apply
     */
    update : function(element, source, repeat, style)
    {
      var tag = this.getTagName(repeat);
      if (tag != element.tagName.toLowerCase()) {
        throw new Error("Image modification not possible because elements could not be replaced at runtime anymore!");
      }

      var ret = this.getAttributes(source, repeat, style);

      if (tag === "img") {
        element.src = ret.src;
      }

      // Fix for old background position
      if (element.style.backgroundPosition != "" && ret.style.backgroundPosition === undefined) {
        ret.style.backgroundPosition = null;
      }

      // Fix for old clip
      if (element.style.clip != "" && ret.style.clip === undefined) {
        ret.style.clip = null;
      }

      // Apply new styles
      var Style = qx.bom.element.Style;
      Style.setStyles(element, ret.style);
    },


    /**
     * Creates a decorator image element with the given options.
     *
     * @param source {String} Any valid URI
     * @param repeat {String} One of <code>scale-x</code>, <code>scale-y</code>,
     *   <code>scale</code>, <code>repeat</code>, <code>repeat-x</code>,
     *   <code>repeat-y</code>, <code>repeat</code>
     * @param style {Map} Additional styles to apply
     */
    create : function(source, repeat, style)
    {
      var tag = this.getTagName(repeat);
      var ret = this.getAttributes(source, repeat, style);
      var css = qx.bom.element.Style.compile(ret.style);

      if (tag === "img") {
        return '<img src="' + ret.src + '" style="' + css + '"/>';
      } else {
        return '<div style="' + css + '"></div>';
      }
    },


    /**
     * Translates the given repeat option to a tag name. Useful
     * for systems which depends on early information of the tag
     * name to prepare element like {@link qx.html.Image}.
     *
     * @param repeat {String} One of <code>scale-x</code>, <code>scale-y</code>,
     *   <code>scale</code>, <code>repeat</code>, <code>repeat-x</code>,
     *   <code>repeat-y</code>, <code>repeat</code>
     * @return {String} The tag name: <code>div</code> or <code>img</code>
     */
    getTagName : function(repeat)
    {
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (this.__enableAlphaFix && this.__alphaFixRepeats[repeat]) {
          return "div";
        }
      }

      return this.__repeatToTagname[repeat];
    },


    /**
     * This method is used to collect all needed attributes for
     * the tag name detected by {@link #getTagName}.
     *
     * @param source {String} Image source
     * @param repeat {String} Repeat mode of the image
     * @param style {Map} Additional styles to apply
     * @return {String} Markup for image
     */
    getAttributes : function(source, repeat, style)
    {
      var ResourceManager = qx.util.ResourceManager;
      var ImageLoader = qx.io2.ImageLoader;
      var Background = qx.bom.element.Background;

      if (!style) {
        style = {};
      }

      if (!style.position) {
        style.position = "absolute";
      }

      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        // Add a fix for small blocks where IE has a minHeight
        // of the fontSize in quirks mode
        style.fontSize = 0;
        style.lineHeight = 0;
      }
      else if (qx.core.Variant.isSet("qx.client", "webkit"))
      {
        // This stops images from being dragable in webkit
        style.WebkitUserDrag = "none";
      }

      // Cache image sizes
      var width = ResourceManager.getImageWidth(source) || ImageLoader.getWidth(source);
      var height = ResourceManager.getImageHeight(source) || ImageLoader.getHeight(source);
      var format = ResourceManager.getImageFormat(source);

      // Enable AlphaImageLoader in IE6
      if (this.__enableAlphaFix && this.__alphaFixRepeats[repeat] && format === "png")
      {
        if (style.width == null) {
          style.width = width == null ? width : width + "px";
        }

        if (style.height == null) {
          style.height = height == null ? height : height + "px";
        }

        style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"
          + ResourceManager.toUri(source) + "', sizingMethod='scale')";

        style.backgroundImage = style.backgroundRepeat = "";

        return {
          style : style
        };
      }
      else
      {
        var clipped = ResourceManager.isClippedImage(source);

        if (repeat === "scale")
        {
          var uri = ResourceManager.toUri(source);

          if (!style.width) {
            style.width = width == null ? width : width + "px";
          }

          if (!style.height) {
            style.height = height == null ? height : height + "px";
          }

          return {
            src : uri,
            style : style
          };
        }
        else if (repeat === "scale-x" || repeat === "scale-y")
        {
          if (clipped)
          {
            // Scale on x-axis
            if (repeat === "scale-x")
            {
              // Use clipped image (multi-images on x-axis)
              var data = ResourceManager.getData(source);
              var imageHeight = ResourceManager.getImageHeight(data[4]);
              var uri = ResourceManager.toUri(data[4]);

              // Add size and clipping
              style.clip = {top: -data[6], height: height};
              style.height = imageHeight + "px";

              // Fix user given y-coordinate to include the combined image offset
              if (style.top != null) {
                style.top = (parseInt(style.top) + data[6]) + "px";
              } else if (style.bottom != null) {
                style.bottom = (parseInt(style.bottom) + height - imageHeight - data[6]) + "px";
              }

              return {
                src : uri,
                style : style
              };
            }

            // Scale on y-axis
            else
            {
              // Use clipped image (multi-images on x-axis)
              var data = ResourceManager.getData(source);
              var imageWidth = ResourceManager.getImageWidth(data[4]);
              var uri = ResourceManager.toUri(data[4]);

              // Add size and clipping
              style.clip = {left: -data[5], width: width};
              style.width = imageWidth + "px";

              // Fix user given x-coordinate to include the combined image offset
              if (style.left != null) {
                style.left = (parseInt(style.left) + data[5]) + "px";
              } else if (style.right != null) {
                style.right = (parseInt(style.right) + width - imageWidth - data[5]) + "px";
              }

              return {
                src : uri,
                style : style
              };
            }
          }

          // No clipped image available
          else
          {
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (this.DEBUG && ResourceManager.has(source) && source.indexOf("qx/icon") == -1)
              {
                if (!this.__warnings) {
                  this.__warnings = {};
                }

                if (!this.__warnings[source])
                {
                  qx.log.Logger.debug("Potential clipped image candidate: " + source);
                  this.__warnings[source] = true;
                }
              }
            }

            if (repeat == "scale-x") {
              style.height = height == null ? null : height + "px";
            } else if (repeat == "scale-y") {
              style.width = width == null ? null : width + "px";
            }

            var uri = ResourceManager.toUri(source);
            return {
              src : uri,
              style : style
            };
          }
        }

        // Native repeats or "no-repeat"
        else
        {
          // Double axis repeats cannot be clipped
          if (clipped && repeat !== "repeat")
          {
            var data = ResourceManager.getData(source);
            var bg = Background.getStyles(data[4], repeat, data[5], data[6]);
            for (var key in bg) {
              style[key] = bg[key];
            }

            if (repeat == "repeat-y" || repeat === "no-repeat") {
              style.width = width == null ? width : width + "px";
            }

            if (repeat == "repeat-x" || repeat === "no-repeat") {
              style.height = height == null ? height : height + "px";
            }

            return {
              style : style
            };
          }
          else
          {
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (this.DEBUG && ResourceManager.has(source) && repeat !== "repeat" && source.indexOf("qx/icon") == -1)
              {
                if (!this.__warnings) {
                  this.__warnings = {};
                }

                if (!this.__warnings[source])
                {
                  qx.log.Logger.debug("Potential clipped image candidate: " + source);
                  this.__warnings[source] = true;
                }
              }
            }

            var bg = Background.getStyles(source, repeat);
            for (var key in bg) {
              style[key] = bg[key];
            }

            style.width = width == null ? width : width + "px";
            style.height = height == null ? height : height + "px";

            return {
              style : style
            };
          }
        }
      }
    }
  }
});
