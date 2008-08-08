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
qx.Class.define("qx.ui.decoration.Uniform",
{
  extend : qx.core.Object,
  implement : [qx.ui.decoration.IDecorator],




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


    /** The URL of the background image */
    backgroundImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyStyle"
    },


    /** How the background image should be repeated */
    backgroundRepeat :
    {
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat", "scale"],
      init : "repeat",
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
      var styles = "position:absolute;top:0;left:0;";

      // Add background color
      var bgcolor = this.getBackgroundColor();
      if (bgcolor) {
        styles += "background-color:" + Color.resolve(bgcolor) + ";";
      }

      // Add border
      var width = this.getWidth();
      if (width > 0)
      {
        var Color = qx.theme.manager.Color.getInstance();
        styles += "border:" + width + "px " + this.getStyle() + " " + Color.resolve(this.getColor()) + ";";
      }

      // Generate markup
      var html = qx.ui.decoration.Util.generateBasicDecor(this.getBackgroundImage(), this.getBackgroundRepeat(), styles);

      // Store
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
      }

      var dom = element.getDomElement();
      dom.style.width = width + "px";
      dom.style.height = height + "px";
    },


    // interface implementation
    tint : function(element, bgcolor)
    {
      var Color = qx.theme.manager.Color.getInstance();
      var dom = element.getDomElement();

      if (bgcolor === undefined) {
        bgcolor = this.getBackgroundColor();
      }

      if (bgcolor == null) {
        bgcolor = "";
      } else {
        bgcolor = Color.resolve(bgcolor);
      }

      dom.style.backgroundColor = bgcolor;
    },


    // interface implementation
    getInsets : function()
    {
      if (this._insets) {
        return this._insets;
      }

      var width = this.getWidth();
      this._insets =
      {
        top : width,
        right : width,
        bottom : width,
        left : width
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
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this.__markup) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }

      this._insets = null;
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
  }
});
