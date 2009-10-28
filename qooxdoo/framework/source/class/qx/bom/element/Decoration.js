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
     * to e.g. disabled icons. Thanks Maria.
     *
     * The situation for IE8 is that running in "IE8 Standards Mode" IE8 has a
     * runtime performance issue. The updates are compared to IE7 (and IE8 in
     * "IE7 Standards Mode" as well) really slow. The cause for this is the
     * dynamic adding/removing of the IMG elements which are part of the
     * decorator. Using the alpha image loader does change this DOM structure
     * to only use DIV elements which do not have a negative performance impact.
     * See Bug #2185 for details.
     */
    __enableAlphaFix : qx.core.Variant.isSet("qx.client", "mshtml") &&
      qx.bom.client.Engine.VERSION < 9,


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
      var tag = this.getTagName(repeat, source);
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
      var tag = this.getTagName(repeat, source);
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
     * @param source {String?null} Source used to identify the image format
     * @return {String} The tag name: <code>div</code> or <code>img</code>
     */
    getTagName : function(repeat, source)
    {
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (source && this.__enableAlphaFix && this.__alphaFixRepeats[repeat] && qx.lang.String.endsWith(source, ".png")) {
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
      var ResourceManager = qx.util.ResourceManager.getInstance();
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
      var format = ResourceManager.getImageFormat(source) || ImageLoader.getFormat(source);

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (source != null && format == null)
        {
          qx.log.Logger.warn("ImageLoader: Not recognized format of external image '" + source + "'!");
        }
      }

      // Enable AlphaImageLoader in IE6/IE7/IE8
      if (this.__enableAlphaFix && this.__alphaFixRepeats[repeat] && format === "png")
      {
        if (style.width == null && width != null) {
          style.width = width + "px";
        }

        if (style.height == null && height != null) {
          style.height = height + "px";
        }

        if (repeat == "no-repeat")
        {
          style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"
            + ResourceManager.toUri(source) + "', sizingMethod='crop')";
        }
        else
        {
          style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"
            + ResourceManager.toUri(source) + "', sizingMethod='scale')";
        }

        style.backgroundImage = style.backgroundRepeat = "";

        return {
          style : style
        };
      }
      else
      {
        if (repeat === "scale")
        {
          var uri = ResourceManager.toUri(source);

          if (style.width == null && width != null) {
            style.width = width + "px";
          }

          if (style.height == null && height != null) {
            style.height = height + "px";
          }

          return {
            src : uri,
            style : style
          };
        }

        var clipped = ResourceManager.isClippedImage(source);

        if (repeat === "scale-x" || repeat === "scale-y")
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

              // note: width is given by the user

              // Fix user given y-coordinate to include the combined image offset
              if (style.top != null) {
                style.top = (parseInt(style.top, 10) + data[6]) + "px";
              } else if (style.bottom != null) {
                style.bottom = (parseInt(style.bottom, 10) + height - imageHeight - data[6]) + "px";
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

              // note: height is given by the user

              // Fix user given x-coordinate to include the combined image offset
              if (style.left != null) {
                style.left = (parseInt(style.left, 10) + data[5]) + "px";
              } else if (style.right != null) {
                style.right = (parseInt(style.right, 10) + width - imageWidth - data[5]) + "px";
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

            if (repeat == "scale-x")
            {
              style.height = height == null ? null : height + "px";
              // note: width is given by the user
            }
            else if (repeat == "scale-y")
            {
              style.width = width == null ? null : width + "px";
              // note: height is given by the user
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
            for (var key in bg)
            {
              if (style[key] === undefined) {
                style[key] = bg[key];
              }
            }

            if (width != null && style.width == null && (repeat == "repeat-y" || repeat === "no-repeat")) {
              style.width = width + "px";
            }

            if (height != null && style.height == null && (repeat == "repeat-x" || repeat === "no-repeat")) {
              style.height = height + "px";
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
            for (var key in bg)
            {
              if (style[key] === undefined) {
                style[key] = bg[key];
              }
            }

            if (width != null && style.width == null) {
              style.width = width + "px";
            }

            if (height != null && style.height == null) {
              style.height = height + "px";
            }

            // Reset the AlphaImageLoader filter if applied
            // This prevents IE from setting BOTH CSS filter AND backgroundImage
            // This is only a fallback if the image is not recognized as PNG
            // If it's a Alpha-PNG file it *may* result in display problems
            if (style.filter) {
              style.filter = "";
            }

            return {
              style : style
            };
          }
        }
      }
    },


    /**
     * For IE browsers the alpha image loader might be necessary. This accessor
     * method provides an API for high-level classes to check if the alpha image
     * loader is enabled.
     */
    isAlphaImageLoaderEnabled : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function() {
        return qx.bom.element.Decoration.__enableAlphaFix;
      },
      
      "default" : function() {
        return false;
      }
    })
  }
});
