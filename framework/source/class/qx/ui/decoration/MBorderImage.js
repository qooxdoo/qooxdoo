/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Decorator which uses the CSS3 border image properties.
 */
qx.Mixin.define("qx.ui.decoration.MBorderImage", {

  properties :
  {
    /**
     * Base image URL.
     */
    borderImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyBorderImage"
    },


    /**
     * The top slice line of the base image. The slice properties divide the
     * image into nine regions, which define the corner, edge and the center
     * images.
     */
    sliceTop :
    {
      check : "Integer",
      nullable : true,
      init : null,
      apply : "_applyBorderImage"
    },

    /**
     * The right slice line of the base image. The slice properties divide the
     * image into nine regions, which define the corner, edge and the center
     * images.
     */
    sliceRight :
    {
      check : "Integer",
      nullable : true,
      init : null,
      apply : "_applyBorderImage"
    },


    /**
     * The bottom slice line of the base image. The slice properties divide the
     * image into nine regions, which define the corner, edge and the center
     * images.
     */
    sliceBottom :
    {
      check : "Integer",
      nullable : true,
      init : null,
      apply : "_applyBorderImage"
    },


    /**
     * The left slice line of the base image. The slice properties divide the
     * image into nine regions, which define the corner, edge and the center
     * images.
     */
    sliceLeft :
    {
      check : "Integer",
      nullable : true,
      init : null,
      apply : "_applyBorderImage"
    },


    /**
     * The slice properties divide the image into nine regions, which define the
     * corner, edge and the center images.
     */
    slice :
    {
      group : [ "sliceTop", "sliceRight", "sliceBottom", "sliceLeft" ],
      mode : "shorthand"
    },


    /**
     * This property specifies how the images for the sides and the middle part
     * of the border image are scaled and tiled horizontally.
     *
     * Values have the following meanings:
     * <ul>
     *   <li><strong>stretch</strong>: The image is stretched to fill the area.</li>
     *   <li><strong>repeat</strong>: The image is tiled (repeated) to fill the area.</li>
     *   <li><strong>round</strong>: The image is tiled (repeated) to fill the area. If it does not
     *    fill the area with a whole number of tiles, the image is rescaled so
     *    that it does.</li>
     * </ul>
     */
    repeatX :
    {
      check : ["stretch", "repeat", "round"],
      init : "stretch",
      apply : "_applyBorderImage"
    },


    /**
     * This property specifies how the images for the sides and the middle part
     * of the border image are scaled and tiled vertically.
     *
     * Values have the following meanings:
     * <ul>
     *   <li><strong>stretch</strong>: The image is stretched to fill the area.</li>
     *   <li><strong>repeat</strong>: The image is tiled (repeated) to fill the area.</li>
     *   <li><strong>round</strong>: The image is tiled (repeated) to fill the area. If it does not
     *    fill the area with a whole number of tiles, the image is rescaled so
     *    that it does.</li>
     * </ul>
     */
    repeatY :
    {
      check : ["stretch", "repeat", "round"],
      init : "stretch",
      apply : "_applyBorderImage"
    },


    /**
     * This property specifies how the images for the sides and the middle part
     * of the border image are scaled and tiled.
     */
    repeat :
    {
      group : ["repeatX", "repeatY"],
      mode : "shorthand"
    },


    /**
     * If set to <code>false</code>, the center image will be omitted and only
     * the border will be drawn.
     */
    fill :
    {
      check : "Boolean",
      init : true,
      apply : "_applyBorderImage"
    },


    /**
     * Configures the border image mode. Supported values:
     * <ul>
     *   <li>horizontal: left and right border images</li>
     *   <li>vertical: top and bottom border images</li>
     *   <li>grid: border images for all edges</li>
     * </ul>
     */
    borderImageMode :
    {
      check : ["horizontal", "vertical", "grid"],
      init : "grid"
    }
  },

  members :
  {
    /**
     * Adds the border-image styles to the given map
     * @param styles {Map} CSS style map
     */
    _styleBorderImage : function(styles)
    {
      if (!this.getBorderImage()) {
        return;
      }
      var resolvedImage = qx.util.AliasManager.getInstance().resolve(this.getBorderImage());
      var source = qx.util.ResourceManager.getInstance().toUri(resolvedImage);

      var computedSlices = this._getDefaultInsetsForBorderImage();

      var slice = [
        computedSlices.top,
        computedSlices.right,
        computedSlices.bottom,
        computedSlices.left
      ];

      var repeat = [
        this.getRepeatX(),
        this.getRepeatY()
      ].join(" ");

      var fill = this.getFill() &&
        qx.core.Environment.get("css.borderimage.standardsyntax") ? " fill" : "";

      var styleName = qx.bom.Style.getPropertyName("borderImage");
      if (styleName) {
        var cssName = qx.bom.Style.getCssName(styleName);
        styles[cssName] = 'url("' + source + '") ' + slice.join(" ") + fill + " " + repeat;
      }
      // Apply border styles even if we couldn't determine the borderImage property name
      // (e.g. because the browser doesn't support it). This is needed to keep
      // the layout intact.
      styles["border-style"] = "solid";
      styles["border-color"] = "transparent";
      styles["border-width"] = slice.join("px ") + "px";
    },


    /**
     * Computes the inset values based on the border image slices (defined in the
     * decoration theme or computed from the fallback image sizes).
     *
     * @return {Map} Map with the top, right, bottom and left insets
     */
    _getDefaultInsetsForBorderImage : function()
    {
      if (!this.getBorderImage()) {
        return {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        };
      }

      var resolvedImage = qx.util.AliasManager.getInstance().resolve(this.getBorderImage());
      var computedSlices = this.__getSlices(resolvedImage);

      return {
        top : this.getSliceTop() || computedSlices[0],
        right: this.getSliceRight() || computedSlices[1],
        bottom: this.getSliceBottom() || computedSlices[2],
        left: this.getSliceLeft() || computedSlices[3]
      };
    },


    _applyBorderImage : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    },


    /**
     * Gets the slice sizes from the fallback border images.
     *
     * @param baseImage {String} Resource Id of the base border image
     * @return {Integer[]} Array with the top, right, bottom and left slice widths
     */
    __getSlices : function(baseImage)
    {
      var mode = this.getBorderImageMode();
      var topSlice = 0;
      var rightSlice = 0;
      var bottomSlice = 0;
      var leftSlice = 0;

      var split = /(.*)(\.[a-z]+)$/.exec(baseImage);
      var prefix = split[1];
      var ext = split[2];

      var ResourceManager = qx.util.ResourceManager.getInstance();

      if (mode == "grid" || mode == "vertical") {
        topSlice = ResourceManager.getImageHeight(prefix + "-t" + ext);
        bottomSlice = ResourceManager.getImageHeight(prefix + "-b" + ext);
      }

      if (mode == "grid" || mode == "horizontal") {
        rightSlice = ResourceManager.getImageWidth(prefix + "-r" + ext);
        leftSlice = ResourceManager.getImageWidth(prefix + "-l" + ext);
      }

      return [topSlice, rightSlice, bottomSlice, leftSlice];
    }
  }
});
