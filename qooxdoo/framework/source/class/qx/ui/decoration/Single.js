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
      init : "solid"
    },

    /** right style of border */
    styleRight :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid"
    },

    /** bottom style of border */
    styleBottom :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid"
    },

    /** left style of border */
    styleLeft :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid"
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
      check : "Color"
    },

    /** right color of border */
    colorRight :
    {
      nullable : true,
      check : "Color"
    },

    /** bottom color of border */
    colorBottom :
    {
      nullable : true,
      check : "Color"
    },

    /** left color of border */
    colorLeft :
    {
      nullable : true,
      check : "Color"
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
      nullable : true
    },

    /** How the background should be repeated */
    backgroundRepeat :
    {
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat", "scale"],
      init : "repeat"
    },


    stretchedImage :
    {
      check : "String",
      nullable : true
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
      if (changes.style || changes.init)
      {
        element.setStyles(this._getStyles());
        this._updateScaledImage(element, width, height);
      }

      if (changes.bgcolor || changes.init) {
        element.setStyle("backgroundColor", qx.theme.manager.Color.getInstance().resolve(backgroundColor) || null);
      }

      if (changes.size || changes.init)
      {
        qx.ui.decoration.Util.updateSize(
          element,
          width, height,
          this.getWidthLeft() + this.getWidthRight(),
          this.getWidthTop() + this.getWidthBottom()
        );
      }
    },


    // interface implementation
    reset : function(element)
    {
      element.setStyles(this._emptyStyles);
      element.removeAll();
    },


    // interface implementation
    getInsets : function()
    {
      if (this.__insets) {
        return this.__insets;
      }

      this.__insets = {
        top : this.getWidthTop(),
        right : this.getWidthRight(),
        bottom : this.getWidthBottom(),
        left : this.getWidthLeft()
      };

      return this.__insets;
    },





    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the CSS style map for the decoration
     *
     * @param width {Integer} The widget's width
     * @param height {Integer} The widget's height
     */
    _getStyles : function(width, height)
    {
      var bgRepeat = this.getBackgroundRepeat();
      var bgImage = null;

      if (bgRepeat === "scale") {
        bgRepeat = null;
      } else {
        bgImage = qx.util.ResourceManager.toUri(qx.util.AliasManager.getInstance().resolve(this.getBackgroundImage()));
      }

      var Color = qx.theme.manager.Color.getInstance();

      var styles =
      {
        "borderTopWidth": this.getWidthTop() + "px",
        "borderTopStyle": this.getStyleTop() || "none",
        "borderTopColor": Color.resolve(this.getColorTop()),
        "borderRightWidth": this.getWidthRight() + "px",
        "borderRightStyle": this.getStyleRight() || "none",
        "borderRightColor": Color.resolve(this.getColorRight()),
        "borderBottomWidth": this.getWidthBottom() + "px",
        "borderBottomStyle": this.getStyleBottom() || "none",
        "borderBottomColor": Color.resolve(this.getColorBottom()),
        "borderLeftWidth": this.getWidthLeft() + "px",
        "borderLeftStyle": this.getStyleLeft() || "none",
        "borderLeftColor": Color.resolve(this.getColorLeft()),
        "backgroundImage": bgImage ? "url(" + bgImage + ")" : null,
        "backgroundRepeat": bgRepeat
      };

      return styles;
    },


    _updateScaledImage : function(el, width, height)
    {
      var bgImage = qx.util.ResourceManager.toUri(qx.util.AliasManager.getInstance().resolve(this.getBackgroundImage()));
      if (!bgImage || this.getBackgroundRepeat() !== "scale")
      {
        el.removeAll();
        return;
      }

      var img = el.getChild(0);
      if (!img)
      {
        img = new qx.html.Image();
        el.add(img);
      }

      img.setSource(bgImage);
      img.setStyle("height", "100%");
      img.setStyle("width", "100%");
    },


    _emptyStyles :
    {
      borderTopWidth: null,
      borderTopStyle: null,
      borderTopColor: null,
      borderRightWidth: null,
      borderRightStyle: null,
      borderRightColor: null,
      borderBottomWidth: null,
      borderBottomStyle: null,
      borderBottomColor: null,
      borderLeftWidth: null,
      borderLeftStyle: null,
      borderLeftColor: null,
      backgroundColor: null,
      backgroundImage: null,
      backgroundRepeat: null
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyWidth : function(value, old)
    {
      this.__insets = null;
      this.__styles = null;
    }
  }
});
