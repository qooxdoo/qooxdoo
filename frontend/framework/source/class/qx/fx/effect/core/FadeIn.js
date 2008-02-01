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
qx.Class.define("qx.fx.effect.core.FadeIn",
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

    if (typeof(options.from) == "undefined")
    {
      if (qx.bom.element.Style.get(element, "display") == "none"){
        fromValue = 0.0;
      }
      else
      {
        var opacity = qx.bom.element.Style.get(element, "opacity");

        if (typeof(opacity) == "number") {
          fromValue = opacity;
        } else {
          fromValue = 0.0;
        }

      }
    }
    else
    {
      fromValue = options.from;
    }
    
    var effectSpecificOptions =
    {
        from : fromValue,
        to   : 1.0
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

    update : function(position) {
      qx.bom.element.Opacity.set(this._element, position);
    },


    beforeSetup : function(effect)
    {
      qx.bom.element.Style.set(this._element, "opacity", this._options.from);
      qx.bom.element.Style.set(this._element, "display", "block");
    },

    render : function(pos)
    {
      if(this._state == qx.fx.Base.EffectState.IDLE)
      {
        this._state = qx.fx.Base.EffectState.RUNNING
        this.beforeSetup();
      }

      if(this._state == qx.fx.Base.EffectState.RUNNING)
      {
        this._position = this._transition(pos) * this._fromToDelta + this._options.from;
        this.update(this._position);
      }
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