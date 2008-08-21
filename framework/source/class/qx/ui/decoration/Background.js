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
 * A very simple decorator featuring background images and colors. No
 * border is supported.
 */
qx.Class.define("qx.ui.decoration.Background",
{
  extend : qx.core.Object,
  implement : [qx.ui.decoration.IDecorator],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param backgroundColor {Color} Initialize with background color
   */
  construct : function(backgroundColor)
  {
    this.base(arguments);

    if (backgroundColor != null) {
      this.setBackgroundColor(backgroundColor);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
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
    init : function(element) {
      element.useMarkup(this.getMarkup());
    },


    // interface implementation
    getMarkup : function()
    {
      if (this.__markup) {
        return this.__markup;
      }

      // Generate markup
      var html = qx.ui.decoration.Util.generateBackgroundMarkup(this.getBackgroundImage(), this.getBackgroundRepeat(), "position:absolute;top:0;left:0;");

      // Store
      return this.__markup = html;
    },


    // interface implementation
    resize : function(element, width, height)
    {
      var dom = element.getDomElement();
      dom.style.width = width + "px";
      dom.style.height = height + "px";
    },


    // interface implementation
    tint : function(element, bgcolor)
    {
      var Color = qx.theme.manager.Color.getInstance();
      var dom = element.getDomElement();

      if (bgcolor == null) {
        bgcolor = this.getBackgroundColor();
      }

      dom.style.backgroundColor = Color.resolve(bgcolor) || "";
    },


    // overridden
    __insets :
    {
      top : 0,
      right : 0,
      bottom : 0,
      left : 0
    },


    // interface implementation
    getInsets : function() {
      return this.__insets;
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

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
