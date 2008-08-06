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
 * A basic decorator featuring background colors and simple borders based on
 * CSS styles.
 */
qx.Class.define("qx.ui.decoration.Single",
{
  extend : qx.core.Object,
  implement : [qx.ui.decoration.IDecorator],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param width {Integer} The border width, see also {@link #width}
   * @param style {String} The border style, see also {@link #style}
   * @param color {Color} The border color, see also {@link #color}
   */
  construct : function(width, style, color)
  {
    this.base(arguments);

    // Create template
    this._tmpl = new qx.util.Template;

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
    /*
    ---------------------------------------------------------------------------
      PROPERTY: WIDTH
    ---------------------------------------------------------------------------
    */

    /** top width of border */
    widthTop :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },

    /** right width of border */
    widthRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },

    /** bottom width of border */
    widthBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },

    /** left width of border */
    widthLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyWidth"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY: STYLE
    ---------------------------------------------------------------------------
    */

    /** top style of border */
    styleTop :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },

    /** right style of border */
    styleRight :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },

    /** bottom style of border */
    styleBottom :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },

    /** left style of border */
    styleLeft :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyStyle"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY: COLOR
    ---------------------------------------------------------------------------
    */

    /** top color of border */
    colorTop :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /** right color of border */
    colorRight :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /** bottom color of border */
    colorBottom :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },

    /** left color of border */
    colorLeft :
    {
      nullable : true,
      check : "Color",
      apply : "_applyStyle"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY: BACKGROUND IMAGE
    ---------------------------------------------------------------------------
    */

    /** The URL of the background image */
    backgroundImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyStyle"
    },

    /** How the background should be repeated */
    backgroundRepeat :
    {
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat", "scale"],
      init : "repeat",
      apply : "_applyStyle"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: EDGE
    ---------------------------------------------------------------------------
    */

    /** Property group to configure the left border */
    left : {
      group : [ "widthLeft", "styleLeft", "colorLeft" ]
    },

    /** Property group to configure the right border */
    right : {
      group : [ "widthRight", "styleRight", "colorRight" ]
    },

    /** Property group to configure the top border */
    top : {
      group : [ "widthTop", "styleTop", "colorTop" ]
    },

    /** Property group to configure the bottom border */
    bottom : {
      group : [ "widthBottom", "styleBottom", "colorBottom" ]
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: TYPE
    ---------------------------------------------------------------------------
    */

    /** Property group to set the border width of all sides */
    width :
    {
      group : [ "widthTop", "widthRight", "widthBottom", "widthLeft" ],
      mode : "shorthand"
    },

    /** Property group to set the border style of all sides */
    style :
    {
      group : [ "styleTop", "styleRight", "styleBottom", "styleLeft" ],
      mode : "shorthand"
    },

    /** Property group to set the border color of all sides */
    color :
    {
      group : [ "colorTop", "colorRight", "colorBottom", "colorLeft" ],
      mode : "shorthand"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      INTERFACE IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    // interface implementation
    render : function(element, width, height, backgroundColor, changes)
    {
      // Be sure template is up-to-date first
      this._updateTemplate();

      // Fix box model
      if (qx.bom.client.Feature.CONTENT_BOX)
      {
        var insets = this.getInsets();
        width -= insets.left + insets.right;
        height -= insets.top + insets.bottom;
      }

      // Resolve background color
      if (backgroundColor) {
        backgroundColor = qx.theme.manager.Color.getInstance().resolve(backgroundColor);
      }

      // Compile HTML
      var html = this._tmpl.run(
      {
        width: width,
        height: height,
        bgcolor: backgroundColor
      });

      // Apply HTML
      element.setAttribute("html", html);
    },


    // interface implementation
    reset : function(element) {
      element.setAttribute("html", null);
    },


    // interface implementation
    getInsets : function()
    {
      if (this._insets) {
        return this._insets;
      }

      this._insets =
      {
        top : this.getWidthTop(),
        right : this.getWidthRight(),
        bottom : this.getWidthBottom(),
        left : this.getWidthLeft()
      };

      return this._insets;
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyWidth : function()
    {
      this._insets = null;
      this._invalidTemplate = true;
    },


    // property apply
    _applyStyle : function() {
      this._invalidTemplate = true;
    },




    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    _invalidTemplate : true,

    _updateTemplate : function()
    {
      if (!this._invalidTemplate) {
        return;
      }

      var Color = qx.theme.manager.Color.getInstance();



      // Add borders
      var styles = {};

      var width = this.getWidthTop();
      if (width > 0) {
        styles.borderTop = width + "px " + this.getStyleTop() + " " + Color.resolve(this.getColorTop());
      }

      var width = this.getWidthRight();
      if (width > 0) {
        styles.borderRight = width + "px " + this.getStyleRight() + " " + Color.resolve(this.getColorRight());
      }

      var width = this.getWidthBottom();
      if (width > 0) {
        styles.borderBottom = width + "px " + this.getStyleBottom() + " " + Color.resolve(this.getColorBottom());
      }

      var width = this.getWidthLeft();
      if (width > 0) {
        styles.borderLeft = width + "px " + this.getStyleLeft() + " " + Color.resolve(this.getColorLeft());
      }

      // Generate tag
      var image = this.getBackgroundImage();
      var repeat = this.getBackgroundRepeat();
      var html = qx.ui.decoration.Util.generateBasicDecor(image, repeat, styles);

      // Update template
      this._tmpl.setContent(html.join(""));

      // Cleanup flag
      this._invalidTemplate = false;
    }
  }
});
