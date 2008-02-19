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

    beforeSetup : function()
    {
      this._offsets = {
        x : this._element.scrollLeft,
        y : this._element.scrollTop
      };
    },

    update : function(position)
    {
      this.base(arguments);

      if(this.getMode() == "relative")
      {
        this._element.scrollLeft = this._offsets.x + this.getX() * position;
        this._element.scrollTop =  this._offsets.y +this.getY() * position;
      }
      else
      {
        this._element.scrollLeft = this.getX() * position;
        this._element.scrollTop = this.getY() * position;
      }

    }

  }

});
