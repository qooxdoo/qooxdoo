/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Alexander Steitz (aback)

************************************************************************ */

/**
 * Powerful creation and update features for images used for decoration
 * purposes like for rounded borders, icons, etc.
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
    /** @type {Boolean} Whether clipping hints should be logged */
    DEBUG : false,

    /** @type {Map} Collect warnings for potential clipped images */
    __warnings : {},

    /** @type {Map} List of repeat modes which supports the IE AlphaImageLoader */
    __alphaFixRepeats : qx.core.Environment.select("engine.name",
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


    /** @type {Map} Mapping between background repeat and the tag to create */
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
        element.src = ret.src || qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif");
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
      qx.bom.element.Style.setStyles(element, ret.style);

      // we need to apply the filter to prevent black rendering artifacts
      // http://blog.hackedbrain.com/archive/2007/05/21/6110.aspx
      if (qx.core.Environment.get("css.alphaimageloaderneeded"))
      {
        try {
          element.filters["DXImageTransform.Microsoft.AlphaImageLoader"].apply();
        } catch(e) {}
      }
    },


    /**
     * Creates the HTML for a decorator image element with the given options.
     *
     * @param source {String} Any valid URI
     * @param repeat {String} One of <code>scale-x</code>, <code>scale-y</code>,
     *   <code>scale</code>, <code>repeat</code>, <code>repeat-x</code>,
     *   <code>repeat-y</code>, <code>repeat</code>
     * @param style {Map} Additional styles to apply
     * @return {String} Decorator image HTML
     */
    create : function(source, repeat, style)
    {
      var tag = this.getTagName(repeat, source);
      var ret = this.getAttributes(source, repeat, style);
      var css = qx.bom.element.Style.compile(ret.style);
      var ResourceManager = qx.util.ResourceManager.getInstance();

      if (ResourceManager.isFontUri(source)) {
        var font = qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)/)[1]);

        var styles = qx.lang.Object.clone(font.getStyles());
        styles['width'] = style.width;
        styles['height'] = style.height;
        styles['fontSize'] = (parseInt(style.width) > parseInt(style.height) ? style.height : style.width);
        styles['display'] = style.display;
        styles['verticalAlign'] = style.verticalAlign;
        styles['position'] = style.position;

        var css = "";
        for (var _style in styles) {
          if (styles.hasOwnProperty(_style)) {
            css += qx.bom.Style.getCssName(_style) + ": " + styles[_style] + ";";
          }
        }

        var resource = ResourceManager.getData(source);
        var charCode;
        if (resource) {
          charCode = resource[2];
        }
        else {
          charCode = parseInt(qx.theme.manager.Font.getInstance().resolve(source.match(/@([^/]+)\/(.*)$/)[2]), 16);
          qx.core.Assert.assertNumber(charCode, "Font source needs either a glyph name or the unicode number in hex");
        }
        
        return '<div style="' + css + '">' + String.fromCharCode(charCode) + '</div>';
      }
      else {
        if (tag === "img") {
          return '<img src="' + ret.src + '" style="' + css + '"/>';
        } else {
          return '<div style="' + css + '"></div>';
        }
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
      if (source && qx.core.Environment.get("css.alphaimageloaderneeded") &&
          this.__alphaFixRepeats[repeat] && source.endsWith(".png"))
      {
        return "div";
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
      if (!style) {
        style = {};
      }

      if (!style.position) {
        style.position = "absolute";
      }

      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        // Add a fix for small blocks where IE has a minHeight
        // of the fontSize in quirks mode
        style.fontSize = 0;
        style.lineHeight = 0;
      }
      else if ((qx.core.Environment.get("engine.name") == "webkit"))
      {
        // This stops images from being draggable in webkit
        style.WebkitUserDrag = "none";
      }

      var format = qx.util.ResourceManager.getInstance().getImageFormat(source) ||
                   qx.io.ImageLoader.getFormat(source);
      if (qx.core.Environment.get("qx.debug"))
      {
        if (source != null && format == null) {
          qx.log.Logger.warn("ImageLoader: Not recognized format of external image '" + source + "'!");
        }
      }

      var result;

      // Enable AlphaImageLoader in IE6/IE7/IE8
      if (qx.core.Environment.get("css.alphaimageloaderneeded") &&
          this.__alphaFixRepeats[repeat] && format === "png")
      {
        var dimension = this.__getDimension(source);
        this.__normalizeWidthHeight(style, dimension.width, dimension.height);
        result = this.processAlphaFix(style, repeat, source);
      }
      else
      {
        delete style.clip;
        if (repeat === "scale") {
          result = this.__processScale(style, repeat, source);
        } else  if (repeat === "scale-x" || repeat === "scale-y") {
          result = this.__processScaleXScaleY(style, repeat, source);
        } else {
          // Native repeats or "no-repeat"
          result = this.__processRepeats(style, repeat, source);
        }
      }

      return result;
    },


    /**
     * Normalize the given width and height values
     *
     * @param style {Map} style information
     * @param width {Integer?null} width as number or null
     * @param height {Integer?null} height as number or null
     */
    __normalizeWidthHeight : function(style, width, height)
    {
      if (style.width == null && width != null) {
        style.width = width + "px";
      }

      if (style.height == null && height != null) {
        style.height = height + "px";
      }
    },


    /**
     * Returns the dimension of the image by calling
     * {@link qx.util.ResourceManager} or {@link qx.io.ImageLoader}
     * depending on if the image is a managed one.
     *
     * @param source {String} image source
     * @return {Map} dimension of image
     */
    __getDimension : function(source)
    {
      var width = qx.util.ResourceManager.getInstance().getImageWidth(source) ||
                  qx.io.ImageLoader.getWidth(source);
      var height = qx.util.ResourceManager.getInstance().getImageHeight(source) ||
                   qx.io.ImageLoader.getHeight(source);

      return {
        width: width,
        height: height
      };
    },


    /**
     * Get all styles for IE browser which need to load the image
     * with the help of the AlphaImageLoader
     *
     * @param style {Map} style information
     * @param repeat {String} repeat mode
     * @param source {String} image source
     *
     * @return {Map} style infos
     */
    processAlphaFix : function(style, repeat, source)
    {
      if (repeat == "repeat" || repeat == "repeat-x" || repeat == "repeat-y") {
        return style;
      }
      var sizingMethod = repeat == "no-repeat" ? "crop" : "scale";
      var filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" +
                   qx.util.ResourceManager.getInstance().toUri(source) +
                   "', sizingMethod='" + sizingMethod + "')";

      style.filter = filter;
      style.backgroundImage = style.backgroundRepeat = "";
      delete style["background-image"];
      delete style["background-repeat"];

      return {
        style : style
      };
    },


    /**
     * Process scaled images.
     *
     * @param style {Map} style information
     * @param repeat {String} repeat mode
     * @param source {String} image source
     *
     * @return {Map} image URI and style infos
     */
    __processScale : function(style, repeat, source)
    {
      var uri = qx.util.ResourceManager.getInstance().toUri(source);
      var dimension = this.__getDimension(source);

      this.__normalizeWidthHeight(style, dimension.width, dimension.height);

      return {
        src : uri,
        style : style
      };
    },


    /**
     * Process images which are either scaled horizontally or
     * vertically.
     *
     * @param style {Map} style information
     * @param repeat {String} repeat mode
     * @param sourceid {String} image resource id
     *
     * @return {Map} image URI and style infos
     */
    __processScaleXScaleY : function(style, repeat, sourceid)
    {
      var ResourceManager = qx.util.ResourceManager.getInstance();
      var clipped = ResourceManager.getCombinedFormat(sourceid);
      var dimension = this.__getDimension(sourceid);
      var uri;

      if (clipped)
      {
        var data = ResourceManager.getData(sourceid);
        var combinedid = data[4];
        if (clipped == "b64") {
          uri = ResourceManager.toDataUri(sourceid);
        }
        else {
          uri = ResourceManager.toUri(combinedid);
        }

        if (repeat === "scale-x") {
          style = this.__getStylesForClippedScaleX(style, data, dimension.height);
        } else {
          style = this.__getStylesForClippedScaleY(style, data, dimension.width);
        }

        return {
          src : uri,
          style : style
        };
      }

      // No clipped image available
      else
      {
        if (qx.core.Environment.get("qx.debug")) {
          this.__checkForPotentialClippedImage(sourceid);
        }

        if (repeat == "scale-x")
        {
          style.height = dimension.height == null ? null : dimension.height + "px";
          // note: width is given by the user
        }
        else if (repeat == "scale-y")
        {
          style.width = dimension.width == null ? null : dimension.width + "px";
          // note: height is given by the user
        }

        uri = ResourceManager.toUri(sourceid);
        return {
          src : uri,
          style : style
        };
      }
    },


    /**
     * Generates the style infos for horizontally scaled clipped images.
     *
     * @param style {Map} style infos
     * @param data {Array} image data retrieved from the {@link qx.util.ResourceManager}
     * @param height {Integer} image height
     *
     * @return {Map} style infos and image URI
     */
    __getStylesForClippedScaleX : function(style, data, height)
    {
      // Use clipped image (multi-images on x-axis)
      var imageHeight = qx.util.ResourceManager.getInstance().getImageHeight(data[4]);

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

      return style;
    },


    /**
     * Generates the style infos for vertically scaled clipped images.
     *
     * @param style {Map} style infos
     * @param data {Array} image data retrieved from the {@link qx.util.ResourceManager}
     * @param width {Integer} image width
     *
     * @return {Map} style infos and image URI
     */
    __getStylesForClippedScaleY : function(style, data, width)
    {
      // Use clipped image (multi-images on x-axis)
      var imageWidth = qx.util.ResourceManager.getInstance().getImageWidth(data[4]);

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

      return style;
    },


    /**
     * Process repeated images.
     *
     * @param style {Map} style information
     * @param repeat {String} repeat mode
     * @param sourceid {String} image resource id
     *
     * @return {Map} image URI and style infos
     */
    __processRepeats : function(style, repeat, sourceid)
    {
      var ResourceManager = qx.util.ResourceManager.getInstance();
      var clipped = ResourceManager.getCombinedFormat(sourceid);
      var dimension = this.__getDimension(sourceid);

      // Double axis repeats cannot be clipped
      if (clipped && repeat !== "repeat")
      {
        // data = [ 8, 5, "png", "qx", "qx/decoration/Modern/arrows-combined.png", -36, 0]
        var data = ResourceManager.getData(sourceid);
        var combinedid = data[4];
        if (clipped == "b64")
        {
          var uri = ResourceManager.toDataUri(sourceid);
          var offx = 0;
          var offy = 0;
        }
        else
        {
          var uri  = ResourceManager.toUri(combinedid);
          var offx = data[5];
          var offy = data[6];

          // honor padding for combined images
          if (style.paddingTop || style.paddingLeft || style.paddingRight || style.paddingBottom) {
            var top = style.paddingTop || 0;
            var left = style.paddingLeft || 0;

            offx += style.paddingLeft || 0;
            offy += style.paddingTop || 0;

            style.clip = {left: left, top: top, width: dimension.width, height: dimension.height};
          }
        }

        var bg = qx.bom.element.Background.getStyles(uri, repeat, offx, offy);
        for (var key in bg) {
          style[key] = bg[key];
        }

        if (dimension.width != null && style.width == null && (repeat == "repeat-y" || repeat === "no-repeat")) {
          style.width = dimension.width + "px";
        }

        if (dimension.height != null && style.height == null && (repeat == "repeat-x" || repeat === "no-repeat")) {
          style.height = dimension.height + "px";
        }

        return {
          style : style
        };
      }
      else
      {
        // honor padding
        var top = style.paddingTop || 0;
        var left = style.paddingLeft || 0;
        style.backgroundPosition = left + "px " + top + "px";

        if (qx.core.Environment.get("qx.debug"))
        {
          if (repeat !== "repeat") {
            this.__checkForPotentialClippedImage(sourceid);
          }
        }

        this.__normalizeWidthHeight(style, dimension.width, dimension.height);
        this.__getStylesForSingleRepeat(style, sourceid, repeat);

        return {
          style : style
        };
      }
    },


    /**
     * Generate all style infos for single repeated images
     *
     * @param style {Map} style information
     * @param repeat {String} repeat mode
     * @param source {String} image source
     */
    __getStylesForSingleRepeat : function(style, source, repeat)
    {
      // retrieve the "backgroundPosition" style if available to prevent
      // overwriting with default values
      var top = null;
      var left = null;
      if (style.backgroundPosition)
      {
        var backgroundPosition = style.backgroundPosition.split(" ");

        left = parseInt(backgroundPosition[0], 10);
        if (isNaN(left)) {
          left = backgroundPosition[0];
        }

        top = parseInt(backgroundPosition[1], 10);
        if (isNaN(top)) {
          top = backgroundPosition[1];
        }
      }

      var bg = qx.bom.element.Background.getStyles(source, repeat, left, top);
      for (var key in bg) {
        style[key] = bg[key];
      }

      // Reset the AlphaImageLoader filter if applied
      // This prevents IE from setting BOTH CSS filter AND backgroundImage
      // This is only a fallback if the image is not recognized as PNG
      // If it's a Alpha-PNG file it *may* result in display problems
      if (style.filter) {
        style.filter = "";
      }
    },


    /**
     * Output a warning if the image can be clipped.
     *
     * @param source {String} image source
     */
    __checkForPotentialClippedImage : function(source)
    {
      if (this.DEBUG && qx.util.ResourceManager.getInstance().has(source) && source.indexOf("qx/icon") == -1)
      {
        if (!this.__warnings[source])
        {
          qx.log.Logger.debug("Potential clipped image candidate: " + source);
          this.__warnings[source] = true;
        }
      }
    }
  }
});
