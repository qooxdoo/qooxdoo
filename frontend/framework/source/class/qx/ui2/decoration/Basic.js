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
 * A basic decoration featuring background colors and simple borders based on
 * CSS styles.
 */
qx.Class.define("qx.ui2.decoration.Basic",
{
  extend : qx.core.Object,
  implement : qx.ui2.decoration.IDecoration,





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

    if (width !== undefined) {
      this.setWidth(width);
    }

    if (style !== undefined) {
      this.setStyle(style);
    }

    if (color !== undefined) {
      this.setColor(color);
    }
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * Converts a typical CSS border definition string to an border object
     *
     * @type static
     * @param str {String} the CSS string
     * @return {qx.ui.core.Border} the created instance
     */
    fromString : function(str)
    {
      var border = new qx.ui2.decoration.Basic;
      var parts = str.split(/\s+/);
      var part, temp;

      for (var i=0, l=parts.length; i<l; i++)
      {
        part = parts[i];

        switch(part)
        {
          case "groove":
          case "ridge":
          case "inset":
          case "outset":
          case "solid":
          case "dotted":
          case "dashed":
          case "double":
          case "none":
            border.setStyle(part);
            break;

          default:
            temp = parseInt(part);

            if (temp === part || qx.lang.String.contains(part, "px")) {
              border.setWidth(temp);
            } else {
              border.setColor(part);
            }

            break;
        }
      }

      return border;
    },


    /**
     * Converts a map property definition into a border object.
     *
     * @type static
     * @param config {Map} map of property values
     * @return {qx.ui.core.Border} the created instance
     */
    fromConfig : function(config)
    {
      var border = new qx.ui2.decoration.Basic;
      border.set(config);
      return border;
    },


    /** The template for the CSS style */
    __styleTemplate :
    [
      "border-top-width: ", null,        // 1
      "px;border-top-style: ", null,     // 3
      ";border-top-color: ", null,       // 5
      ";border-right-width: ", null,     // 7
      "px;border-right-style: ", null,   // 9
      ";border-right-color: ", null,     // 11
      ";border-bottom-width: ", null,    // 13
      "px;border-bottom-style: ", null,  // 15
      ";border-bottom-color: ", null,    // 17
      ";border-left-width: ", null,      // 19
      "px;border-left-style: ", null,    // 21
      ";border-left-color: ", null,      // 23
      ";width: ", null,                  // 25
      "px;height: ", null,               // 27
      "px;background-color: ", null,      // 29
      ";position:absolute",
      ";top:0px;left:0px"
    ]


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
      apply : "_applyBorderChange"
    },

    /** right width of border */
    widthRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** bottom width of border */
    widthBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** left width of border */
    widthLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
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
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyBorderChange"
    },

    /** right style of border */
    styleRight :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyBorderChange"
    },

    /** bottom style of border */
    styleBottom :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyBorderChange"
    },

    /** left style of border */
    styleLeft :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double", "outset", "inset", "ridge", "groove" ],
      init : "solid",
      apply : "_applyBorderChange"
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
      apply : "_applyColorTop"
    },

    /** right color of border */
    colorRight :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorRight"
    },

    /** bottom color of border */
    colorBottom :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorBottom"
    },

    /** left color of border */
    colorLeft :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColorLeft"
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: EDGE
    ---------------------------------------------------------------------------
    */

    left : {
      group : [ "widthLeft", "styleLeft", "colorLeft" ]
    },

    right : {
      group : [ "widthRight", "styleRight", "colorRight" ]
    },

    top : {
      group : [ "widthTop", "styleTop", "colorTop" ]
    },

    bottom : {
      group : [ "widthBottom", "styleBottom", "colorBottom" ]
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: TYPE
    ---------------------------------------------------------------------------
    */

    width :
    {
      group : [ "widthTop", "widthRight", "widthBottom", "widthLeft" ],
      mode : "shorthand"
    },

    style :
    {
      group : [ "styleTop", "styleRight", "styleBottom", "styleLeft" ],
      mode : "shorthand"
    },

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

    _getStyle : function(widget, width, height)
    {
      var template = qx.ui2.decoration.Basic.__styleTemplate;

      template[1] = this.getWidthTop() || "0";
      template[3] = this.getStyleTop() || "none";
      template[5] = this.__colorTop || "";

      template[7] = this.getWidthRight() || "0";
      template[9] = this.getStyleRight() || "none";
      template[11] = this.__colorRight || "";

      template[13] = this.getWidthBottom() || "0";
      template[15] = this.getStyleBottom() || "none";
      template[17] = this.__colorBottom || "";

      template[19] = this.getWidthLeft() || "0";
      template[21] = this.getStyleLeft() || "none";
      template[23] = this.__colorLeft || "";

      // TODO: rspect box model
      var borderWidth = this.getWidthLeft() + this.getWidthRight();
      var borderHeight = this.getWidthTop() + this.getWidthBottom();

      if (qx.bom.client.Feature.BORDER_BOX)
      {
        template[25] = width;
        template[27] = height;
      }
      else
      {
        template[25] = width - borderWidth;
        template[27] = height - borderHeight;
      }

      template[29] = widget.getBackgroundColor();

      return template.join("");
    },


    // interface implementation
    init : function(widget, decorationElement) {
    },


    // interface implementation
    update : function(widget, decorationElement, width, height)
    {
      var decorationHtml = "<div style='" + this._getStyle(widget, width, height) + "'></div>";
      decorationElement.setAttribute("html", decorationHtml);
    },


    // interface implementation
    reset : function(widget, decorationElement) {
      decorationElement.setAttribute("html", "");
    },


    // interface implementation
    getInsets : function()
    {
      return {
        top : this.getWidthTop(),
        right : this.getWidthTop(),
        bottom : this.getWidthBottom(),
        left : this.getWidthLeft()
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyBorderChange : function(value, old, name) {
      this.__informManager();
    },

    // property apply
    _applyColorTop : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorTop, this, value);
    },

    // property apply
    _applyColorRight : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorRight, this, value);
    },

    // property apply
    _applyColorBottom : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorBottom, this, value);
    },

    // property apply
    _applyColorLeft : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorLeft, this, value);
    },



    /*
    ---------------------------------------------------------------------------
      COLOR MANAGER CONNECTION
    ---------------------------------------------------------------------------
    */

    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorTop : function(value)
    {
      this.__colorTop = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorRight : function(value)
    {
      this.__colorRight = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorBottom : function(value)
    {
      this.__colorBottom = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorLeft : function(value)
    {
      this.__colorLeft = value;
      this.__informManager();
    },



    /*
    ---------------------------------------------------------------------------
      BORDER MANAGER CONNECTION
    ---------------------------------------------------------------------------
    */

    /**
     * Send information to BorderManager
     *
     * @type member
     */
    __informManager : function() {
      qx.ui2.decoration.DecorationManager.getInstance().updateObjects(this);
    }

  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {


  }
});
