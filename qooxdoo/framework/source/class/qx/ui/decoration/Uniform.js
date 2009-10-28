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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A simple decorator featuring background images and colors and a simple
 * uniform border based on CSS styles.
 */
qx.Class.define("qx.ui.decoration.Uniform",
{
  extend : qx.ui.decoration.Abstract,
  include : [qx.ui.decoration.MBackgroundImage],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param width {Integer} Width of the border
   * @param style {String} Any supported border style
   * @param color {Color} The border color
   */
  construct : function(width, style, color)
  {
    this.base(arguments);

    // Initialize properties
    if (width != null) {
      this.setWidth(width);
    }

    if (style != null) {
      this.setStyle(style);
    }

    if (color != null) {
      this.setColor(color);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Set the border width of all sides */
    width :
    {
      check : "PositiveInteger",
      init : 0,
      apply : "_applyWidth"
    },

    /** The border style of all sides */
    style :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },

    /** Set the border color of all sides */
    color :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /** Color of the background */
    backgroundColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyStyle"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __markup : null,


    // overridden
    _getDefaultInsets : function()
    {
      var width = this.getWidth();
      return {
        top : width,
        right : width,
        bottom : width,
        left : width
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

    // interface implementation
    getMarkup : function()
    {
      if (this.__markup) {
        return this.__markup;
      }

      // Init styles
      var styles = { 
        position: "absolute",
        top: 0,
        left: 0
      };

      // Check
      var width = this.getWidth();
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (width === 0) {
          throw new Error("Invalid Uniform decorator (zero border width). Use qx.ui.decorator.Background instead!");
        }
      }

      // Add styles
      var Color = qx.theme.manager.Color.getInstance();
      styles.border = width + "px " + this.getStyle() + " " + Color.resolve(this.getColor());

      var html = this._generateBackgroundMarkup(styles);

      return this.__markup = html;
    },


    // interface implementation
    resize : function(element, width, height)
    {
      // Fix box model
      // Note: Scaled images are always using content box
      var scaledImage = this.getBackgroundImage() && this.getBackgroundRepeat() == "scale";
      if (scaledImage || qx.bom.client.Feature.CONTENT_BOX)
      {
        var inset = this.getWidth() * 2;
        width -= inset;
        height -= inset;

        // Fix to keep applied size above zero
        // Makes issues in IE7 when applying value like '-4px'
        if (width < 0) {
          width = 0;
        }

        if (height < 0) {
          height = 0;
        }
      }

      element.style.width = width + "px";
      element.style.height = height + "px";
    },


    // interface implementation
    tint : function(element, bgcolor)
    {
      var Color = qx.theme.manager.Color.getInstance();

      if (bgcolor == null) {
        bgcolor = this.getBackgroundColor();
      }

      element.style.backgroundColor = Color.resolve(bgcolor) || "";
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyWidth : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__markup) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }

      this._resetInsets();
    },


    // property apply
    _applyStyle : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__markup) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__markup", "__insets");
  }
});
