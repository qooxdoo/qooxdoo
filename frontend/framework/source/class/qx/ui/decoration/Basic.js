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
qx.Class.define("qx.ui.decoration.Basic",
{
  extend : qx.core.Object,
  include : qx.util.manager.MConnectedObject,
  implement : qx.ui.decoration.IDecorator,





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

    this._needUpdate = true;

    var decorationManager = qx.theme.manager.Decoration.getInstance();
    var self = this;
    this._updateManager = new qx.util.DeferredCall(function() {
      decorationManager.updateObjects(self)
    });

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
     * @return {qx.ui.core.Decoration} the created instance
     */
    fromString : function(str)
    {
      var border = new qx.ui.decoration.Basic;
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
     * @return {qx.ui.core.Decoration} the created instance
     */
    fromConfig : function(config)
    {
      var border = new qx.ui.decoration.Basic;
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
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyBorderChange"
    },

    /** right style of border */
    styleRight :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyBorderChange"
    },

    /** bottom style of border */
    styleBottom :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyBorderChange"
    },

    /** left style of border */
    styleLeft :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
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
    /**
     * Initialize the element's size
     *
     * @param decorationElement {qx.html.Element} The widget's decoration element.
     */
    _initSize : function(decorationElement)
    {
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (qx.bom.client.Feature.CONTENT_BOX) {
          this._useContentBox = true;
          return;
        }
      }
      else
      {
        decorationElement.setStyle("boxSizing", "border-box");
      }
      decorationElement.setStyle("width", "100%");
      decorationElement.setStyle("height", "100%");
    },


    /**
     * Update the element's size
     *
     * @param decorationElement {qx.html.Element} The widget's decoration element.
     * @param height {Integer} The widget's new height
     * @param width {Integer} The widget's new width
     */
    _updateSize : function(decorationElement, width, height)
    {
      if (!this._useContentBox) {
        return;
      }

      var borderWidth = this.getWidthLeft() + this.getWidthRight();
      var borderHeight = this.getWidthTop() + this.getWidthBottom();

      decorationElement.setStyle("width", width - borderWidth);
      decorationElement.setStyle("height", height - borderHeight);
    },


    // interface implementation
    init : function(decorationElement)
    {
      this._initSize(decorationElement);
      decorationElement.setStyles({
        "position": "absolute",
        "top": 0,
        "left": 0
      })
    },


    // interface implementation
    reuse : function(decorationElement) {
      this.init(decorationElement);
    },


    /**
     * Get the CSS style map for the decoration
     *
     * @param width {Integer} The widget's width
     * @param height {Integer} The widget's height
     */
    _getStyles : function(width, height)
    {
      var styles = {
        "borderTopWidth": this.getWidthTop(),
        "borderTopStyle": this.getStyleTop() || "none",
        "borderTopColor": this.__colorTop,
        "borderRightWidth": this.getWidthRight(),
        "borderRightStyle": this.getStyleRight() || "none",
        "borderRightColor": this.__colorRight,
        "borderBottomWidth": this.getWidthBottom(),
        "borderBottomStyle": this.getStyleBottom() || "none",
        "borderBottomColor": this.__colorBottom,
        "borderLeftWidth": this.getWidthLeft(),
        "borderLeftStyle": this.getStyleLeft() || "none",
        "borderLeftColor": this.__colorLeft
      }
      return styles;
    },


    _updateBackgroundImage : function(decorationElement, backgroundImage, backgroundRepeat)
    {
      switch (backgroundRepeat)
      {
        case "tile":
          decorationElement.setStyles({
            "backgroundImage": "url(" + backgroundImage + ")",
            "backgroundRepeat": "repeat"
          });
          break;

        case "stretch":
          // TODO
          break;

        case "image":
          decorationElement.setStyles({
            "backgroundImage": "url(" + backgroundImage + ")",
            "backgroundRepeat": "no-repeat"
          });
          break;
      }
    },


    // interface implementation
    update : function(decorationElement, width, height, backgroundColor, backgroundImage, backgroundRepeat)
    {
      if (this._needsUpdate)
      {
        decorationElement.setStyles(this._getStyles());
        this._needUpdate = false;
        this._updateManager.cancel();
      }
      if (backgroundImage) {
        this._updateBackgroundImage(decorationElement, backgroundImage, backgroundRepeat || "tile");
      }
      if (backgroundColor) {
        decorationElement.setStyle("backgroundColor", backgroundColor);
      }
      this._updateSize(decorationElement, width, height);
    },


    // interface implementation
    reset : function(decorationElement)
    {
      decorationElement.setStyles({
        "borderTopWidth": null,
        "borderTopStyle": null,
        "borderTopColor": null,
        "borderRightWidth": null,
        "borderRightStyle": null,
        "borderRightColor": null,
        "borderBottomWidth": null,
        "borderBottomStyle": null,
        "borderBottomColor": null,
        "borderLeftWidth": null,
        "borderLeftStyle": null,
        "borderLeftColor": null,
        "backgroundColor": null,
        "width": null,
        "height": null,
        "position": "absolute",
        "top": 0,
        "left": 0
      });
    },


    // interface implementation
    getInsets : function()
    {
      return {
        top : this.getWidthTop(),
        right : this.getWidthRight(),
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

    // property apply
    _applyBackgroundColor : function(value) {
      qx.theme.manager.Color.getInstance().connect(this._changeBackgroundColor, this, value);
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

    /**
     * Callback for color manager connection
     *
     * @type member
     * @param color {Color} any CSS acceptable color value
     * @return {void}
     */
    _changeBackgroundColor : function(color)
    {
      this.__bgColor = color;
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
    __informManager : function()
    {
      this._needsUpdate = true;
      this._updateManager.schedule();
    }

  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_updateManager");
  }
});
