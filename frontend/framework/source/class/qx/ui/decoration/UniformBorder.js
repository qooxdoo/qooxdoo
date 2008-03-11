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
 * A very simple decorator featuring background colors and a simple uniform
 * border based on CSS styles.
 */
qx.Class.define("qx.ui.decoration.UniformBorder",
{
  extend : qx.core.Object,
  implement : qx.ui.decoration.IDecorator,

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
      check : "Number",
      init : 0,
      apply : "_applyBorderChange"
    },

    /** The border style of all sides */
    style :
    {
      nullable : true,
      check : [ "solid", "dotted", "dashed", "double"],
      init : "solid",
      apply : "_applyBorderChange"
    },

    /** Set the border color of all sides */
    color :
    {
      nullable : true,
      check : "Color",
      apply : "_applyColor"
    },

    /** The background color */
    backgroundColor :
    {
      nullable : true,
      init : "inherit",
      check : "Color",
      apply : "_applyBackgroundColor"
    },

    /** The URL of the background image */
    backgroundImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyBorderChange"
    },

    /** How the background should be repeated */
    backgroundRepeat :
    {
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat"],
      init : "repeat",
      apply : "_applyBorderChange"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {String} border color */
    __color : "",

    /** {String} background color */
    __bgColor: "",


    /**
     * Initialize the element's size
     *
     * @param decorationElement {qx.html.Element} The widget's decoration element.
     */
    _initSize : function(decorationElement)
    {
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (qx.bom.client.Feature.CONTENT_BOX)
        {
          this._useContentBox = true;
          return;
        }
      }
      else
      {
        decorationElement.setStyle("boxSizing", "border-box");
      }
    },


    // interface implementation
    init : function(decorationElement) {
      this._initSize(decorationElement);
    },


    // interface implementation
    update : function(decorationElement, width, height, backgroundColor)
    {
      var borderWidth = this.getWidth();
      if (this._useContentBox)
      {
        var elWidth = width - 2 * borderWidth;
        var elHeight = height - 2 * borderWidth;
      }
      else
      {
        var elWidth = width;
        var elHeight = height;
      }

      var bgImage = this.getBackgroundImage();
      decorationElement.setStyles({
        "border": this.getWidth() + "px " + this.getStyle() + " " + this.__color,
        "backgroundImage": bgImage ? "url(" + bgImage + ")" : null,
        "backgroundRepeat": this.getBackgroundRepeat(),
        "backgroundColor": backgroundColor || this.__bgColor,
        "width": elWidth + "px",
        "height": elHeight + "px"
      });
    },


    // interface implementation
    reset : function(decorationElement)
    {
      decorationElement.setStyles({
        "border": null,
        "backgroundImage": null,
        "backgroundRepeat": null,
        "backgroundColor": null
      });
    },


    // interface implementation
    getInsets : function()
    {
      var width = this.getWidth();
      return {
        top : width,
        right : width,
        bottom : width,
        left : width
      }
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyBorderChange : function(value, old, name) {
      qx.ui.core.queue.Decorator.add(this);
    },

    // property apply
    _applyColor : function(value, old) {
      qx.theme.manager.Color.getInstance().connect(this._changeColor, this, value);
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
    _changeColor : function(value)
    {
      if (value) {
        this.__color = value;
      } else {
        delete this.__color;
      }
      qx.ui.core.queue.Decorator.add(this);
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
      if (color) {
        this.__bgColor = color;
      } else {
        delete this.__bgColor;
      }
      qx.ui.core.queue.Decorator.add(this);
    }
  }
});
