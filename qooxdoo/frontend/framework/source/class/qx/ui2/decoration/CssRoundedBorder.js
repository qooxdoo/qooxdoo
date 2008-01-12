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

qx.Class.define("qx.ui2.decoration.CssRoundedBorder",
{
  extend : qx.ui2.decoration.Basic,



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
      init : 0,
      apply : "_applyBorderChange"
    },

    radiusTopRight :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : 0,
      apply : "_applyBorderChange"
    },

    radiusBottomRight :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : 0,
      apply : "_applyBorderChange"
    },

    radiusBottomLeft :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : 0,
      apply : "_applyBorderChange"
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: RADIUS
    ---------------------------------------------------------------------------
    */

    radius : {
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
    _getStyle : function(widget, width, height)
    {
      var style = [this.base(arguments, widget, width, height), ";"];

      var topLeft = this.getRadiusTopLeft();
      if (topLeft !== 0)
      {
        style.push("-moz-border-radius-topleft: ");
        style.push(topLeft instanceof Array ? topLeft.join(" ") : topLeft);
        style.push(";");
      }

      var topRight = this.getRadiusTopRight();
      if (topRight !== 0)
      {
        style.push("-moz-border-radius-topright: ");
        style.push(topRight instanceof Array ? topRight.join("px ") : topRight);
        style.push("px;");
      }

      var bottomRight = this.getRadiusBottomRight();
      if (bottomRight !== 0)
      {
        style.push("-moz-border-radius-bottomright: ");
        style.push(bottomRight instanceof Array ? bottomRight.join("px ") : bottomRight);
        style.push("px;");
      }

      var bottomLeft = this.getRadiusBottomLeft();
      if (bottomLeft !== 0)
      {
        style.push("-moz-border-radius-bottomleft: ");
        style.push(bottomLeft instanceof Array ? bottomLeft.join("px ") : bottomLeft);
        style.push("px;");
      }

      return style.join("");
    }

  }
});
