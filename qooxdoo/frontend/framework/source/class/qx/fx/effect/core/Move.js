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
 * TODO
 */
qx.Class.define("qx.fx.effect.core.Move",
{

  extend : qx.fx.Base,

  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element, options)
  {

    var effectSpecificOptions = {
      x : 0,
      y : 0
    };

    for(var i in effectSpecificOptions)
    {
      if (typeof(options[i]) == "undefined") {
        options[i] = effectSpecificOptions[i];
      }
    }

    this.base(arguments, element, options);
  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
  },

  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

   members :
   {

    setup : function()
    {
      this.base(arguments);

      this._originalLeft = qx.bom.element.Location.getLeft(this._element, "box");
      this._originalTop = qx.bom.element.Location.getTop(this._element, "box");

      if (this._options.mode == 'absolute') {
        this._x = this._options.x - this._originalLeft;
        this._y = this._options.y - this._originalTop;
      }else{
        this._x = this._options.x;
        this._y = this._options.y;
      }
    },


    update : function(position)
    {
      this.base(arguments);

      qx.bom.element.Style.set(this._element, "left", Math.round(this._x  * position + this._originalLeft));
      qx.bom.element.Style.set(this._element, "top", Math.round(this._y  * position + this._originalTop));
    }

   },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {

  }

});
