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
 * Combination effect "Drop Out"
 *
 * The specified element will move to the given direction and fade out.
 */
qx.Class.define("qx.fx.effect.combination.DropOut",
{

  extend : qx.fx.Base,


  /*
   *****************************************************************************
      CONSTRUCTOR
   *****************************************************************************
  */

  /**
   * @param element {Object} The DOM element
   */
  construct : function(element)
  {

    this.base(arguments, element);

    this._moveEffect = new qx.fx.effect.core.Move(this._element);
    this._fadeEffect = new qx.fx.effect.core.Fade(this._element);

    this._mainEffect = new qx.fx.effect.core.Parallel(this._moveEffect, this._fadeEffect);

  },


  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {
    /**
     * Direction in which the element should drop out.
     */
    direction :
    {
      init : "south",
      check : [ "south", "west", "east", "north", "south-west", "south-east", "north-east", "north-west" ]
    },

    /**
     * Amount of pixel the element should move horizontally while fading out.
     */
    xAmount :
    {
      init : 100,
      check : "Number"
    },

    /**
     * Amount of pixel the element should move vertically while fading out.
     */
    yAmount :
    {
      init : 100,
      check : "Number"
    },

    /**
     * Flag indicating if the CSS attribute "display"
     * should be modified by effect
     */
    modifyDisplay :
    {
      init : true,
      check : "Boolean"
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
        top     : qx.bom.element.Location.getTop(this._element, "scroll"),
        left    : qx.bom.element.Location.getLeft(this._element, "scroll"),
        opacity : qx.bom.element.Style.get(this._element, "opacity")
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
      this._fadeEffect.afterFinishInternal = function()
      {
        for (var property in oldStyle) {
          qx.bom.element.Style.set(this._element, property, oldStyle[property]);
        }
      };

      this._fadeEffect.set({
        duration : 0.5,
        sync : true,
        to : 0,
        from : oldStyle.opacity,
        modifyDisplay : this.getModifyDisplay()
      });

      this._mainEffect.start();

    }

  },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function() {
    this._disposeObjects("_moveEffect", "_fadeEffect", "_mainEffect");
  }

});
