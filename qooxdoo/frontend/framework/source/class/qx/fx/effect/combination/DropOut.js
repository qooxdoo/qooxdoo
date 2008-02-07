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

  construct : function(element)
  {

    this.base(arguments, element);

    this._moveEffect = new qx.fx.effect.core.Move(this._element);
    this._fadeEffect = new qx.fx.effect.core.FadeOut(this._element);

    this._mainEffect = new qx.fx.effect.core.Parallel([
       this._moveEffect,
       this._fadeEffect
    ]);

  },


  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {

    direction :
    {
      init : "south",
      check : [ "south", "west", "east", "north", "south-west", "south-east", "north-east", "north-west" ]
    },

    xAmount :
    {
      init : 100,
      check : "Number"
    },

    yAmount :
    {
      init : 100,
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

    start : function()
    {
      this.base(arguments);

      var xAmount = this.getXAmount();
      var yAmount = this.getYAmount();

      var oldStyle = {
        top  : qx.bom.element.Location.getTop(this._element, "scroll"),
        left : qx.bom.element.Location.getLeft(this._element, "scroll")
      };

      var moveEffectOptions = {
        x    : xAmount,
        y    : yAmount,
        sync : true
      };

      switch(this.getDirection())
      {
        case "south":
          moveEffectOptions.x = 0;
          moveEffectOptions.y = yAmount;
        break;

        case "north":
          moveEffectOptions.x = 0;
          moveEffectOptions.y = -yAmount;
        break;

        case "west":
          moveEffectOptions.x = -xAmount;
          moveEffectOptions.y = 0;
        break;

        case "east":
          moveEffectOptions.x = xAmount;
          moveEffectOptions.y = 0;
        break;

        case "south-west":
          moveEffectOptions.x = -xAmount;
          moveEffectOptions.y = yAmount;
        break;

        case "south-east":
          moveEffectOptions.x = xAmount;
          moveEffectOptions.y = yAmount;
        break;

        case "north-east":
          moveEffectOptions.x = xAmount;
          moveEffectOptions.y = -yAmount;
        break;

        case "north-west":
          moveEffectOptions.x = -xAmount;
          moveEffectOptions.y = -yAmount;
        break;

      }

      this._moveEffect.set(moveEffectOptions);
      this._moveEffect.afterFinishInternal = function()
      {
        for (var property in oldStyle) {
          qx.bom.element.Style.set(this._element, property, oldStyle[property]);
        }
      };

      this._fadeEffect.set({
        duration : 0.5,
        sync : true
      });

      this._mainEffect.start();

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
