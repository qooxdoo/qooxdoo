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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Decorator, which uses the CSS3 border image properties.
 *
 * This decorator can be used as replacement for {@link qx.ui.layout.Grid},
 * {@link qx.ui.layout.HBox} and {@link qx.ui.layout.VBox} decorators in
 * browsers, which support it.
 *
 * Supported browsers are:
 * <ul>
 *   <li>Firefox >= 3.5</li>
 *   <li>Safari >= 4</li>
 *   <li>Chrome >= 3</li>
 * <ul>
 */
qx.Class.define("qx.ui.decoration.css3.BorderImage",
{
  extend : qx.ui.decoration.Decorator,

  /**
   * @param borderImage {String} Base image to use
   * @param slice {Integer|Array} Sets the {@link #slice} property
   */
  construct : function(borderImage, slice)
  {
    this.base(arguments);

    // Initialize properties
    if (borderImage != null) {
      this.setBorderImage(borderImage);
    }

    if (slice != null) {
      this.setSlice(slice);
    }
  },


  statics :
  {
    /**
     * Whether the browser supports this decorator
     */
    IS_SUPPORTED : qx.bom.element.Style.isPropertySupported("borderImage")
  },


  members :
  {
    __markup : null,


    // overridden
    _getDefaultInsets : function()
    {
      return {
        top : 0,
        right : 0,
        bottom : 0,
        left : 0
      };
    },


    // overridden
    _isInitialized: function() {
      return !!this.__markup;
    },


    /*
    ---------------------------------------------------------------------------
      INTERFACE IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    getStyles : function() {
      var source = this._resolveImageUrl(this.getBorderImage());
      var slice = [
        this.getSliceTop(),
        this.getSliceRight(),
        this.getSliceBottom(),
        this.getSliceLeft()
      ];

      var repeat = [
        this.getRepeatX(),
        this.getRepeatY()
      ].join(" ")

      var fill = this.getFill() ? " fill" : "";

      var styles = {
        "borderImage" : 'url("' + source + '") ' + slice.join(" ") + fill + " " + repeat,
        "borderStyle" : "solid",
        "borderColor" : "transparent",
        position: "absolute",
        lineHeight: 0,
        fontSize: 0,
        overflow: "hidden",
        boxSizing: "border-box",
        borderWidth: slice.join("px ") + "px"
      };
      return styles;
    },

    // interface implementation
    getMarkup : function()
    {
      if (this.__markup) {
        return this.__markup;
      }

      var source = this._resolveImageUrl(this.getBorderImage());
      var slice = [
        this.getSliceTop(),
        this.getSliceRight(),
        this.getSliceBottom(),
        this.getSliceLeft()
      ];

      var repeat = [
        this.getRepeatX(),
        this.getRepeatY()
      ].join(" ")

      var fill = this.getFill() &&
        qx.core.Environment.get("css.borderimage.standardsyntax") ? " fill" : "";

      this.__markup = [
        "<div style='",
        qx.bom.element.Style.compile({
          "borderImage" : 'url("' + source + '") ' + slice.join(" ") + fill + " " + repeat,
          "borderStyle" : "solid",
          "borderColor" : "transparent",
          position: "absolute",
          lineHeight: 0,
          fontSize: 0,
          overflow: "hidden",
          boxSizing: "border-box",
          borderWidth: slice.join("px ") + "px"
        }),
        ";'></div>"
      ].join("");

      // Store
      return this.__markup;
    },


    // interface implementation
    resize : function(element, width, height)
    {
      element.style.width = width + "px";
      element.style.height = height + "px";
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyStyle : function(value, old, name)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    },


    /**
     * Resolve the url of the given image
     *
     * @param image {String} base image URL
     * @return {String} the resolved image URL
     */
    _resolveImageUrl : function(image)
    {
      return qx.util.ResourceManager.getInstance().toUri(
        qx.util.AliasManager.getInstance().resolve(image)
      );
    }
  },


  destruct : function() {
    this.__markup = null;
  }
});
