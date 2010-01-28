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
  extend : qx.ui.decoration.Abstract,
  include : [qx.ui.decoration.MBackgroundImage],



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
      return {
        top : 0,
        right : 0,
        bottom : 0,
        left : 0
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

      var styles = {
        position: "absolute",
        top: 0,
        left: 0
      };
      var html = this._generateBackgroundMarkup(styles);

      // Store
      return this.__markup = html;
    },


    // interface implementation
    resize : function(element, width, height)
    {
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
    _applyStyle : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this._isInitialized()) {
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
     this.__markup = null;
   }
});
