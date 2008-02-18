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

qx.Class.define("qx.ui.decoration.RoundedBorder",
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
      PROPERTY: WIDTH
    ---------------------------------------------------------------------------
    */

    radiusTopLeft :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : null,
      nullable : true,
      apply : "_applyBorderChange"
    },

    radiusTopRight :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : null,
      nullable : true,
      apply : "_applyBorderChange"
    },

    radiusBottomRight :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : null,
      nullable : true,
      apply : "_applyBorderChange"
    },

    radiusBottomLeft :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : null,
      nullable : true,
      apply : "_applyBorderChange"
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: RADIUS
    ---------------------------------------------------------------------------
    */

    radius :
    {
      group : [ "radiusTopRight", "radiusBottomRight", "radiusBottomLeft", "radiusTopLeft" ],
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
    _getStyles : function(width, height)
    {
      var style = this.base(arguments, width, height);


      var topLeft = this.getRadiusTopLeft();
      style.MozBorderRadiusTopleft = topLeft instanceof Array ? topLeft.join(" ") : topLeft;

      var topRight = this.getRadiusTopRight();
      style.MozBorderRadiusTopright = topRight instanceof Array ? topRight.join(" ") : topRight;

      var bottomRight = this.getRadiusBottomRight();
      style.MozBorderRadiusBottomright = bottomRight instanceof Array ? bottomRight.join(" ") : bottomRight;

      var bottomLeft = this.getRadiusBottomLeft();
      style.MozBorderRadiusBottomleft = bottomLeft instanceof Array ? bottomLeft.join(" ") : bottomLeft;

      return style;
    },


    reset : function(decorationElement)
    {
      this.base(arguments, decorationElement);
      decorationElement.setStyles({
        MozBorderRadiusTopleft: null,
        MozBorderRadiusTopright: null,
        MozBorderRadiusBottomright: null,
        MozBorderRadiusBottomleft: null
      });
    }

  }
});
