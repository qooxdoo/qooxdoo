/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
      apply : "_applyStyle"
    },


    /**
     * The top slice line of the base image. The slice properties divide the
     * image into nine regions, which define the corner, edge and the center
     * images.
     */
    sliceTop :
    {
      check : "Integer",
      init : 0,
      apply : "_applyStyle"
    },


    /**
     * The right slice line of the base image. The slice properties divide the
     * image into nine regions, which define the corner, edge and the center
     * images.
     */
    sliceRight :
    {
      check : "Integer",
      init : 0,
      apply : "_applyStyle"
    },


    /**
     * The bottom slice line of the base image. The slice properties divide the
     * image into nine regions, which define the corner, edge and the center
     * images.
     */
    sliceBottom :
    {
      check : "Integer",
      init : 0,
      apply : "_applyStyle"
    },


    /**
     * The left slice line of the base image. The slice properties divide the
     * image into nine regions, which define the corner, edge and the center
     * images.
     */
    sliceLeft :
    {
      check : "Integer",
      init : 0,
      apply : "_applyStyle"
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
      apply : "_applyStyle"
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
      apply : "_applyStyle"
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
      init : true
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
      var source = qx.util.ResourceManager.getInstance().toUri(
        qx.util.AliasManager.getInstance().resolve(this.getBorderImage())
      );

      var slice = [
        this.getSliceTop(),
        this.getSliceRight(),
        this.getSliceBottom(),
        this.getSliceLeft()
      ];

      var repeat = [
        this.getRepeatX(),
        this.getRepeatY()
      ].join(" ");

      var fill = this.getFill() ? " fill" : "";

      styles["border-image"] = 'url("' + source + '") ' + slice.join(" ") + fill + " " + repeat;
      styles["border-style"] = "solid";
      styles["border-color"] = "transparent";
      styles["border-width"] = slice.join("px ") + "px";
    }
  }
});
