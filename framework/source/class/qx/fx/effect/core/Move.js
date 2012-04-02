/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

   ======================================================================

   This class contains code based on the following work:

   * script.aculo.us
       http://script.aculo.us/
       Version 1.8.1

     Copyright:
       (c) 2008 Thomas Fuchs

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Author:
       Thomas Fuchs

************************************************************************ */

/**
 * Core effect "Move"
 *
 * Moves to element to the given coordinates.
 * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
 */
qx.Class.define("qx.fx.effect.core.Move",
{

  extend : qx.fx.Base,


   /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {
    /**
     * String indicating if the coordinates are relative
     * to element's position or absolute.
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    mode :
    {
      init : "relative",
      check : [ "relative", "absolute" ]
    },

    /**
     * X coordinate the element should be moved to.
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    x :
    {
      init : 0,
      check : "Number"
    },

    /**
     * Y coordinate the element should be moved to.
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
    y :
    {
      init : 0,
      check : "Number"
    }

  },

  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

  members :
  {

    __x : null,
    __y : null,
    __originalLeft : null,
    __originalTop : null,
    __originalPosition : null,

    setup : function()
    {
      var element = this._getElement();
      this.base(arguments);

      if(element.parentNode)
      {
        this.__originalLeft =
          qx.bom.element.Location.getLeft(element) -
          qx.bom.element.Location.getLeft(element.parentNode);

        this.__originalTop =
          qx.bom.element.Location.getTop(element) -
          qx.bom.element.Location.getTop(element.parentNode);
      }
      else
      {
        this.__originalLeft = qx.bom.element.Location.getLeft(element);
        this.__originalTop = qx.bom.element.Location.getTop(element);
      }
      this.__originalPosition = qx.bom.element.Style.get(element, "position");

      qx.bom.element.Style.set(element, "position", "absolute");

      if (this.getMode() == 'absolute')
      {
        this.__x = this.getX() - this.__originalLeft;
        this.__y = this.getY() - this.__originalTop;
      }
      else
      {
        this.__x = this.getX();
        this.__y = this.getY();
      }
    },


    update : function(position)
    {
      var element = this._getElement();
      this.base(arguments);

      var left = Math.round(this.__x  * position + this.__originalLeft);
      var top = Math.round(this.__y  * position + this.__originalTop);

      qx.bom.element.Style.set(element, "left", left + "px");
      qx.bom.element.Style.set(element, "top", top + "px");
    },

    afterFinishInternal : function()
    {
      qx.bom.element.Style.set(
        this._getElement(),
        "position",
        this.__originalPosition);
    }
  }
});
