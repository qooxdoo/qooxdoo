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
qx.Class.define("qx.fx.Move",
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
        x    : 0,
        y    : 0,
        mode : 'relative'
    };

    for(var i in effectSpecificOptions)
    {
      if (!options[i]) {
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
      /*
      this.element.makePositioned();
      this._originalLeft = parseFloat(this.element.getStyle('left') || '0');
      this._originalTop  = parseFloat(this.element.getStyle('top')  || '0');
      */
    
      this.base(arguments);
    
      this._originalLeft = qx.bom.element.Style.get(this._element, "left"); 
      this._originalTop  = qx.bom.element.Style.get(this._element, "top"); 

      if (this._options.mode == 'absolute')
      {
        this._options.x = this._options.x - this._originalLeft;
        this._options.y = this._options.y - this._originalTop;
      }
    },


    update : function(position)
    {
      console.warn(position, this._element)
      /*
      this.element.setStyle({
        left: (this._options.x  * position + this._originalLeft).round() + 'px',
        top:  (this._options.y  * position + this._originalTop).round()  + 'px'
      });
      */

      qx.bom.element.Style.set(this._element, "left", Math.round(this._options.x  * position + this._originalLeft));
      qx.bom.element.Style.set(this._element, "top", Math.round(this._options.y  * position + this._originalTop));
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
