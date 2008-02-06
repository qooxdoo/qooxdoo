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

/* ************************************************************************

#require(qx.fx.Base)
#require(qx.fx.Transition)

************************************************************************ */

/**
 * TODO
 */

qx.Class.define("qx.fx.effect.combination.DropOut",
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
      direction : 'south',
      xAmount   : 100,
      yAmount   : 100
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

    start : function()
    {
      this.base(arguments);

      var oldStyle = {
        top  : qx.bom.element.Location.getTop(this._element, "scroll"),
        left : qx.bom.element.Location.getLeft(this._element, "scroll")
      };

      var moveEffectOptions = {
        x    : 0,
        y    : this._options.xAmount,
        sync : true
      };

      switch(this._options.direction)
      {
        case "south":
          moveEffectOptions.x = 0;
          moveEffectOptions.y = this._options.yAmount;
        break;
          
        case "north":
          moveEffectOptions.x = 0;
          moveEffectOptions.y = -this._options.yAmount;
        break;
          
        case "west":
          moveEffectOptions.x = -this._options.xAmount;
          moveEffectOptions.y = 0;
        break;
          
        case "east":
          moveEffectOptions.x = this._options.xAmount;
          moveEffectOptions.y = 0;
        break;
          
        case "south-west":
          moveEffectOptions.x = -this._options.xAmount;
          moveEffectOptions.y = this._options.yAmount;
        break;
          
        case "south-east":
          moveEffectOptions.x = this._options.xAmount;
          moveEffectOptions.y = this._options.yAmount;
        break;
          
        case "north-east":
          moveEffectOptions.x = this._options.xAmount;
          moveEffectOptions.y = -this._options.yAmount;
        break;
          
        case "north-west":
          moveEffectOptions.x = -this._options.xAmount;
          moveEffectOptions.y = -this._options.yAmount;
        break;

      }

      var moveEffect = new qx.fx.effect.core.Move(
        this._element,
        moveEffectOptions
      );

      moveEffect.afterFinishInternal = function()
      {
        for (var property in oldStyle) {
          qx.bom.element.Style.set(this._element, property, oldStyle[property]);
        }
      };

      var fadeEffect = new qx.fx.effect.core.FadeOut(
        this._element,
        {
          duration : 0.5,
          sync : true
        }
      );

      this._effect = new qx.fx.effect.core.Parallel(
        {
          1 : moveEffect,
          2 : fadeEffect
        }
      ).start();

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
