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
 * Beveled is a variant of a rounded decorator which is quite optimal
 * regarding performance and still delivers a good set of features:
 *
 * * One pixel rounded border
 * * Inner glow color with optional transparency
 * * Repeated or scaled background image
 * @deprecated{3.0}
 */
qx.Class.define("qx.ui.decoration.Beveled",
{
  extend : qx.ui.decoration.Decorator,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param outerColor {Color} The outer border color
   * @param innerColor {Color} The inner border color
   * @param innerOpacity {Float} Opacity of inner border
   */
  construct : function(outerColor, innerColor, innerOpacity)
  {
    this.base(arguments);

    // Initialize properties
    if (outerColor != null) {
      this.setOuterColor(outerColor);
    }

    if (innerColor != null) {
      this.setInnerColor(innerColor);
    }

    if (innerOpacity != null) {
      this.setInnerOpacity(innerOpacity);
    }

    if (qx.core.Environment.get("qx.debug")) {
      qx.log.Logger.deprecatedClassWarning(this.constructor,
       "Use 'qx.ui.decoration.Decorator' instead.");
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /**
     * Color of the outer frame. The corners are automatically
     * rendered with a slight opacity to fade into the background
     */
    outerColor :
    {
      check : "Color",
      nullable : true
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
        top : 2,
        right : 2,
        bottom : 2,
        left : 2
      };
    },


    // overridden
    _isInitialized: function() {
      return !!this.__markup;
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyStyle : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this.__markup) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    },





    /*
    ---------------------------------------------------------------------------
      INTERFACE IMPLEMENTATION
    ---------------------------------------------------------------------------
    */


    // interface implementation
    resize : function(element, width, height)
    {
      // Fix to keep applied size above zero
      // Makes issues in IE7 when applying value like '-4px'
      if (width < 4) {
        width = 4;
      }

      if (height < 4) {
        height = 4;
      }

      // Fix box model
      if (qx.core.Environment.get("css.boxmodel") == "content")
      {
        var outerWidth = width - 2;
        var outerHeight = height - 2;
        var frameWidth = outerWidth;
        var frameHeight = outerHeight;
        var innerWidth = width - 4;
        var innerHeight = height - 4;
      }
      else
      {
        var outerWidth = width;
        var outerHeight = height;
        var frameWidth = width - 2;
        var frameHeight = height - 2;
        var innerWidth = frameWidth;
        var innerHeight = frameHeight;
      }

      var pixel = "px";

      var backgroundFrame = element.childNodes[0].style;
      backgroundFrame.width = outerWidth + pixel;
      backgroundFrame.height = outerHeight + pixel;

      var horizontalFrame = element.childNodes[1].style;
      horizontalFrame.width = outerWidth + pixel;
      horizontalFrame.height = frameHeight + pixel;

      var verticalFrame = element.childNodes[2].style;
      verticalFrame.width = frameWidth + pixel;
      verticalFrame.height = outerHeight + pixel;

      var innerBackground = element.childNodes[3].style;
      innerBackground.width = frameWidth + pixel;
      innerBackground.height = frameHeight + pixel;

      var innerOverlay = element.childNodes[4].style;
      innerOverlay.width = innerWidth + pixel;
      innerOverlay.height = innerHeight + pixel;
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
