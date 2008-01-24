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
qx.Class.define("qx.fx.Appear",
{

  extend : qx.fx.Base,
  
  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element, options)
  {
    var fromValue;
    var opacity = qx.bom.element.Style.get(element, "opacity");

    if (qx.bom.element.Style.get(element, "display") == "none"){
      fromValue = 0.0;
    }
    else
    {
      if (typeof(opacity) == "number") {
        fromValue = opacity;
      } else {
        fromValue = 0.0;
      }
    }

    var effectSpecificOptions =
    {
        from : fromValue,
        to   : 1.0
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

    afterFinishInternal : function()
    {
      //effect.element.forceRerendering();
    },


    update : function(position) {
      qx.bom.element.Opacity.set(this._element, position);
    },


    beforeSetup : function(effect)
    {
      qx.bom.element.Style.set(this._element, "opacity", this._options.from);
      qx.bom.element.Style.set(this._element, "display", "block");
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