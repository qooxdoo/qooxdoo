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

    /** {Boolean} Whether the alpha image loader is needed */
    __enableAlphaFix : qx.core.Variant.isSet("qx.client", "mshtml") && qx.bom.client.Engine.VERSION < 8,


    /** {Map} List of repeat modes which supports the IE AlphaImageLoader */
    __alphaFixRepeats :
    {
      "scale-x" : true,
      "scale-y" : true,
      "scale" : true,
      "no-repeat" : true
    },


    __switchStyles :
    {
      backgroundImage : null,
      backgroundRepeat : null,
      backgroundPosition : null,
      clip : null
    },


    update : function(element, source, repeat)
    {
      var ret = this.collect(source, repeat);
      if (ret.tag != element.tagName.toLowerCase()) {
        throw new Error("Image modification not possible because elements could not be replaced at runtime anymore!");
      }

      if (ret.tag === "img") {
        element.src = ret.source;
      }

      var Style = qx.bom.element.Style;

      Style.setStyles(element, this.__switchStyles);
      Style.setStyles(element, ret.style);
    },


    create : function(source, repeat, style)
    {
      var ret = this.collect(source, repeat, style);
      var css = qx.bom.element.Style.compile(ret.style);

      if (ret.tag == "img") {
        return '<img src="' + ret.source + '" style="' + css + '"/>';
      } else {
        return '<div style="' + css + '"></div>';
      }
    },


    /**
     * A method to create images.
     *
     * This method automatically fall-backs to
     * IE's alpha image loader to render images with alpha
     * transparency.
     *
     * @param source {String} Image source
     * @param repeat {String} Repeat mode of the image
     * @return {String} Markup for image
     */
    collect : function(source, repeat, style)
    {
      var ResourceManager = qx.util.ResourceManager;
      var Background = qx.bom.element.Background;

      if (!style) {
        style = {};
      }

      style.position = "absolute";

      // Add a fix for small blocks where IE has a minHeight
      // of the fontSize in quirks mode
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        style.fontSize = 0;
        style.lineHeight = 0;
      }

      if (this.__enableAlphaFix && this.__alphaFixRepeats[repeat])
      {
        if (repeat !== "scale-x") {
          style.width = ResourceManager.getImageWidth(source) + "px";
        }

        if (repeat !== "scale-y") {
          style.height = ResourceManager.getImageHeight(source) + "px";
        }

        style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"
          + ResourceManager.toUri(source) + "', sizingMethod='scale')";

        return {
          tag : "div",
          style : style
        };
      }
      else
      {
        var clipped = ResourceManager.isClippedImage(source);

        if (repeat === "scale")
        {
          var uri = ResourceManager.toUri(source);
          return {
            tag : "img",
            source : uri,
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
              var data = ResourceManager.getClippedImageData(source);
              var showHeight = ResourceManager.getImageHeight(source);
              var imageHeight = ResourceManager.getImageHeight(data.source);
              var uri = ResourceManager.toUri(data.source);

              // Add size and clipping
              style.clip = {top: -data.top, height: showHeight};
              style.height = imageHeight + "px";

              // Fix user given y-coordinate to include the combined image offset
              if (style.top != null) {
                style.top = (parseInt(style.top) + data.top) + "px";
              } else if (style.bottom != null) {
                style.bottom = (parseInt(style.bottom) + showHeight - imageHeight - data.top) + "px";
              }

              return {
                tag : "img",
                source : uri,
                style : style
              };
            }

            // Scale on y-axis
            else
            {
              // Use clipped image (multi-images on x-axis)
              var data = ResourceManager.getClippedImageData(source);
              var showWidth = ResourceManager.getImageWidth(source);
              var imageWidth = ResourceManager.getImageWidth(data.source);
              var uri = ResourceManager.toUri(data.source);

              // Add size and clipping
              style.clip = {left: -data.left, width: showWidth};
              style.width = imageWidth + "px";

              // Fix user given x-coordinate to include the combined image offset
              if (style.left != null) {
                style.left = (parseInt(style.left) + data.left) + "px";
              } else if (style.right != null) {
                style.right = (parseInt(style.right) + showWidth - imageWidth - data.left) + "px";
              }

              return {
                tag : "img",
                source : uri,
                style : style
              };
            }
          }

          // No clipped image available or scaled on both axis
          else
          {
            if (qx.core.Variant.isSet("qx.debug", "on")) {
              qx.log.Logger.warn("Please make use of clipped image for: " + source);
            }

            if (repeat == "scale-x") {
              style.height = ResourceManager.getImageHeight(source) + "px";
            } else if (repeat == "scale-y") {
              style.width = ResourceManager.getImageWidth(source) + "px";
            }

            var uri = ResourceManager.toUri(source);
            return {
              tag : "img",
              source : uri,
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
            var data = ResourceManager.getClippedImageData(source);
            var bg = Background.getStyles(data.source, repeat, data.left, data.top);
            for (var key in bg) {
              style[key] = bg[key];
            }

            if (repeat == "repeat-y" || repeat === "no-repeat") {
              style.width = ResourceManager.getImageWidth(source) + "px";
            }

            if (repeat == "repeat-x" || repeat === "no-repeat") {
              style.height = ResourceManager.getImageHeight(source) + "px";
            }

            return {
              tag : "div",
              style : style
            };
          }
          else
          {
            var bg = Background.getStyles(source, repeat);
            for (var key in bg) {
              style[key] = bg[key];
            }

            style.width = ResourceManager.getImageWidth(source) + "px";
            style.height = ResourceManager.getImageHeight(source) + "px";

            return {
              tag : "div",
              style : style
            };
          }
        }
      }
    }
  }
});
