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
     * Jonathan Rass (jonathan_rass)

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
 * Core effect "Scroll"
 *
 * This effect scrolls to specified coordinates on given element.
 */
qx.Class.define("qx.fx.effect.core.Scroll",
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
     * String indicating if the coordinates are relative or absolute.
     */
    mode :
    {
      init : "relative",
      check : [ "relative", "absolute" ]
    },

    /**
     * X coordinate the element should be scroll to.
     */
    x :
    {
      init : 0,
      check : "Number"
    },

    /**
     * Y coordinate the element should be scroll to.
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

     __startOffsets : null,
     __deltaOffsets : null,

    start : function()
    {
      if (!this.base(arguments)) {
        return;
      }
      var element = this._getElement();

      this.__startOffsets = {
        x : element.scrollLeft,
        y : element.scrollTop
      };

      // Stop if element can not scroll further
      if (this._atEndPosition(this.__startOffsets.x, this.__startOffsets.y)) {
        return ;
      }

      if(this.getMode() == "absolute")
      {
        this.__deltaOffsets = {
          left : this.getX() - this.__startOffsets.x,
          top  : this.getY() - this.__startOffsets.y
        };
      }

    },


    update : function(position)
    {
      this.base(arguments);
      var element = this._getElement();

      if(this.getMode() == "relative")
      {

        if (this.getX() != 0) {
          element.scrollLeft = this.__startOffsets.x + (this.getX() * position);
        }

        if (this.getY() != 0) {
          element.scrollTop = this.__startOffsets.y + (this.getY() * position);
        }

      }
      else
      {
        element.scrollLeft = this.__startOffsets.x + (this.__deltaOffsets.left * position);
        element.scrollTop = this.__startOffsets.y + (this.__deltaOffsets.top * position);
      }

    },


    /**
     * Helper function verifying if scroll action can
     * be performed or if scroll properties are at a limit.
     *
     *  @param left {Number} Element's current offsetLeft
     *  @param top {Number} Element's current offsetTop
     *  @return {Boolean} true, if scroll properties are
     *  at a limit, otherwise false: scrolling can be
     *  performed.
     */
    _atEndPosition : function(left, top)
    {
      var element = this._getElement();
      var x = this.getX();
      var y = this.getY();

      return
      (
        ( (x < 0) && (left == 0) ) || // left limit
        ( (x > 0) && (left == (element.scrollWidth - element.clientWidth)) ) // right limit
      )
      &&
      (
        ( (y < 0) && (top == 0) ) || // upper limit
        ( (y > 0) && (top == (element.scrollHeight - element.clientHeight)) ) // lower limit
      );
    }

  }

});
