/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

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

    createElement : function(widget)
    {
      var border = new qx.html.Element("div");
      return border;
    },


    update : function(widget, borderElement)
    {
      borderElement.setStyles({
        borderLeftWidth : this.getWidthLeft() || "0px",
        borderLeftStyle : this.getStyleLeft() || "none",
        borderLeftColor : this.__colorLeft || "",
        borderTopWidth : this.getWidthTop() || "0px",
        borderTopStyle : this.getStyleTop() || "none",
        borderTopColor : this.__colorTop || "",
        borderRightWidth : this.getWidthRight() || "0px",
        borderRightStyle : this.getStyleRight() || "none",
        borderRightColor : this.__colorRight || "",
        borderBottomWidth : this.getWidthBottom() || "0px",
        borderBottomStyle : this.getStyleBottom() || "none",
        borderBottomColor : this.__colorBottom || "",
        backgroundColor : widget.getBackgroundColor()
      });
    },


    updateSize : function(widget, borderElement, width, height)
    {
      var borderWidth = this.getWidthLeft() + this.getWidthRight();
      var borderHeight = this.getWidthTop() + this.getWidthBottom();
      borderElement.setStyles({
        width: (width - borderWidth) + "px",
        height: (height - borderHeight) + "px"
      });
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyBorderChange : function(value, old, name) {
      this.__informManager();
    },

    _applyColorTop : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorTop, this, value);
    },

    _applyColorRight : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorRight, this, value);
    },

    _applyColorBottom : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorBottom, this, value);
    },

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