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

qx.Class.define("qx.ui2.border.CssRoundedBorder",
{
  extend : qx.ui2.border.Basic,



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
      apply : "_applyBorderTop"
    },

    radiusTopRight :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : 0,
      apply : "_applyBorderRight"
    },

    radiusBottomRight :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : 0,
      apply : "_applyBorderBottom"
    },

    radiusBottomLeft :
    {
      check : "typeof(value) === 'number' || value instanceof Array",
      init : 0,
      apply : "_applyBorderLeft"
    },

    /*
    ---------------------------------------------------------------------------
      PROPERTY GROUP: RADIUS
    ---------------------------------------------------------------------------
    */

    radius : {
      group : [ "radiusTopRight", "radiusBottomRight", "radiusBottomLeft", "radiusTopLeft" ]
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
   updateEdge : function(widget, borderElement, edge)
   {
     this.base(arguments, widget, borderElement, edge);

     switch (edge)
     {
       case "left":
         var topLeft = this.getRadiusTopLeft();
         if (topLeft !== 0)
         {
           var leftStr = topLeft instanceof Array ? topLeft : topLeft.join("px ");
           leftStr += "px";
           borderElement.setStyle("MozBorderTopLeftRadius", leftStr);
         }
         break;

       case "top":
         var topRight = this.getRadiusTopRight();
         if (topRight !== 0)
         {
           var topStr = topLeft instanceof Array ? topRight : topRight.join("px ");
           topStr += "px";
           borderElement.setStyle("MozBorderTopRightRadius", topStr);
         }
         break;

       case "bpttom":
         var bottomRight = this.getRadiusBottomRight();
         if (bottomRight !== 0)
         {
           var bottomStr = bottomRight instanceof Array ? bottomRight : bottomRight.join("px ");
           bottomStr += "px";
           borderElement.setStyle("MozBorderBottomRightRadius", bottomStr);
         }
         break;

       case "left":
         var bottomLeft = this.getRadiusBottomLeft();
         if (bottomLeft !== 0)
         {
           var leftStr = bottomLeft instanceof Array ? bottomLeft : bottomLeft.join("px ");
           leftStr += "px";
           borderElement.setStyle("MozBorderBottomLeftRadius", leftStr);
         }
         break;

     }
   }

  }
});