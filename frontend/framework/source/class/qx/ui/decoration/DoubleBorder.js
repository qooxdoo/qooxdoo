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
 *
 */
qx.Class.define("qx.ui.decoration.DoubleBorder",
{
  extend : qx.ui.decoration.Basic,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER WIDTH
    ---------------------------------------------------------------------------
    */

    /** top width of border */
    innerWidthTop :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** right width of border */
    innerWidthRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** bottom width of border */
    innerWidthBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** left width of border */
    innerWidthLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** Property group to set the inner border width of all sides */
    innerWidth :
    {
      group : [ "innerWidthTop", "innerWidthRight", "innerWidthBottom", "innerWidthLeft" ],
      mode : "shorthand"
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER COLOR
    ---------------------------------------------------------------------------
    */

    /** top inner color of border */
    colorInnerTop :
    {
      nullable : true,
      apply : "_applyColorInnerTop"
    },

    /** right inner color of border */
    colorInnerRight :
    {
      nullable : true,
      apply : "_applyColorInnerRight"
    },

    /** bottom inner color of border */
    colorInnerBottom :
    {
      nullable : true,
      apply : "_applyColorInnerBottom"
    },

    /** left inner color of border */
    colorInnerLeft :
    {
      nullable : true,
      apply : "_applyColorInnerLeft"
    },

    innerColor :
    {
      group : [ "colorInnerTop", "colorInnerRight", "colorInnerBottom", "colorInnerLeft" ],
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
      var innerElement = decorationElement.getChild(0);

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
        innerElement.setStyle("boxSizing", "border-box");
      }
      decorationElement.setStyle("width", "100%");
      decorationElement.setStyle("height", "100%");

      innerElement.setStyle("width", "100%");
      innerElement.setStyle("height", "100%");
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
      this.base(arguments, decorationElement, width, height)

      var borderWidth =
        this.getWidthLeft() + this.getWidthRight() +
        this.getInnerWidthLeft() + this.getInnerWidthRight();

      var borderHeight =
        this.getWidthTop() + this.getWidthBottom() +
        this.getInnerWidthTop() + this.getInnerWidthBottom();

      var innerElement = decorationElement.getChild(0);
      innerElement.setStyle("width", width - borderWidth);
      innerElement.setStyle("height", height - borderHeight);
    },


    init : function(decorationElement)
    {
      var innerElement = new qx.html.Element();
      innerElement.setStyles({
        position: "absolute",
        top: 0,
        left: 0
      });
      decorationElement.add(innerElement);

      this.base(arguments, decorationElement);
    },


    /**
     * Get the CSS style map for the decoration
     *
     * @param width {Integer} The widget's width
     * @param height {Integer} The widget's height
     * @return {Map} a map containing the computed CSS styles
     */
    _getInnerStyles : function(width, height)
    {
      var styles = {
        "borderTopWidth": this.getInnerWidthTop(),
        "borderTopColor": this.__colorInnerTop,
        "borderRightWidth": this.getInnerWidthRight(),
        "borderRightColor": this.__colorInnerRight,
        "borderBottomWidth": this.getInnerWidthBottom(),
        "borderBottomColor": this.__colorInnerBottom,
        "borderLeftWidth": this.getInnerWidthLeft(),
        "borderLeftColor": this.__colorInnerLeft,
        "backgroundColor": this.__bgColor,
        "borderStyle": "solid"
      }
      return styles;
    },


    // interface implementation
    update : function(decorationElement, width, height)
    {
      if (this._needsUpdate)
      {
        var innerElement = decorationElement.getChild(0);
        innerElement.setStyles(this._getInnerStyles());
      }
      this.base(arguments, decorationElement, width, height);
    },


    // interface implementation
    reset : function(decorationElement)
    {
      decorationElement.removeAt(0);
      this.base(arguments, decorationElement)
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyColorInnerTop : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorInnerTop, this, value);
    },

    // property apply
    _applyColorInnerRight : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorInnerRight, this, value);
    },

    // property apply
    _applyColorInnerBottom : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorInnerBottom, this, value);
    },

    // property apply
    _applyColorInnerLeft : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColorInnerLeft, this, value);
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorInnerTop : function(value)
    {
      this.__colorInnerTop = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorInnerRight : function(value)
    {
      this.__colorInnerRight = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorInnerBottom : function(value)
    {
      this.__colorInnerBottom = value;
      this.__informManager();
    },


    /**
     * Reacts on color changes reported by the connected ColorManager.
     *
     * @type member
     * @param value {Color} the color value to apply
     */
    _changeColorInnerLeft : function(value)
    {
      this.__colorInnerLeft = value;
      this.__informManager();
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
  }
});