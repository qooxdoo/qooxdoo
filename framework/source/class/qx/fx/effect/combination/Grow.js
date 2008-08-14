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
 * Combination effect "Grow"
 *
 * The element will be resized from initial dimensions to
 * final dimensions.
 */

qx.Class.define("qx.fx.effect.combination.Grow",
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

    this.__moveEffect = new qx.fx.effect.core.Move(element);
    this.__scaleEffect = new qx.fx.effect.core.Scale(element);
    this.__mainEffect = new qx.fx.effect.core.Parallel(this.__moveEffect, this.__scaleEffect);

  },

  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {

    /**
     * Direction in which the element should grow.
     */
    direction :
    {
      init : "center",
      check : [ "top-left", "top-right", "bottom-left", "bottom-right",  "center" ]
    },

    /**
     * Transition function to modify the scaling process.
     */
    scaleTransition :
    {
      init : "sinodial",

      // keep this in sync with qx.fx.Transition!
      check  : ["linear", "easeInQuad", "easeOutQuad", "sinodial", "reverse", "flicker", "wobble", "pulse", "spring", "none", "full"]
    },

    /**
     * Transition function to modify the movement process.
     */
    moveTransition :
    {
      init : "sinodial",

      // keep this in sync with qx.fx.Transition!
      check  : ["linear", "easeInQuad", "easeOutQuad", "sinodial", "reverse", "flicker", "wobble", "pulse", "spring", "none", "full"]
    }

  },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

   members :
   {

     __scaleEffect : null,
     __moveEffect : null,
     __mainEffect : null,

    setup : function()
    {
      this.base(arguments);
    },

    start : function()
    {
      if (!this.base(arguments)) {
        return;
      }
      var element = this._getElement();

      // Element must be visible for move effect
      qx.bom.element.Style.set(element, "display", "block");
      qx.bom.element.Style.set(element, "overflow", "hidden");

      var initialMoveX, initialMoveY;
      var moveX, moveY;

      var oldStyle = {
        top    : qx.bom.element.Location.getTop(element),
        left   : qx.bom.element.Location.getLeft(element),
        width  : qx.bom.element.Dimension.getWidth(element),
        height : qx.bom.element.Dimension.getHeight(element),
        overflow : "visible"
      };

      this.__scaleEffect.afterFinishInternal = function()
      {
        var value;
        var element = this._getElement();

        for (var property in oldStyle)
        {
          value = oldStyle[property];
          if (property != "overflow") {
            value += "px";
          }
          qx.bom.element.Style.set(element, property, value);
        }
      };


      switch (this.getDirection())
      {
        case 'top-left':
          initialMoveX = initialMoveY = moveX = moveY = 0;
        break;

        case 'top-right':
          initialMoveX = oldStyle.width;
          initialMoveY = moveY = 0;
          moveX = -oldStyle.width;
        break;

        case 'bottom-left':
          initialMoveX = moveX = 0;
          initialMoveY = oldStyle.height;
          moveY = -oldStyle.height;
        break;

        case 'bottom-right':
          initialMoveX = oldStyle.width;
          initialMoveY = oldStyle.height;
          moveX = -oldStyle.width;
          moveY = -oldStyle.height;
        break;

        case 'center':
          initialMoveX = Math.round(oldStyle.width / 2);
          initialMoveY = Math.round(oldStyle.height / 2);
          moveX = -Math.round(oldStyle.width / 2);
          moveY = -Math.round(oldStyle.height / 2);
        break;
      }

      this.__moveEffect.set({
        x          : moveX,
        y          : moveY,
        sync       : true,
        transition : this.getMoveTransition()
      });

      this.__scaleEffect.set({
        scaleTo              : 100,
        sync                 : true,
        scaleFrom            : 0,
        scaleFromCenter      : false,
        transition           : this.getScaleTransition(),
        alternateDimensions  : [oldStyle.width, oldStyle.height]
      });

      qx.bom.element.Style.set(element, "top", (oldStyle.top + initialMoveY) + "px");
      qx.bom.element.Style.set(element, "left", (oldStyle.left + initialMoveX) + "px");

      qx.bom.element.Style.set(element, "height", "0px");
      qx.bom.element.Style.set(element, "width", "0px");

      this.__mainEffect.start();
    }


   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function()
   {
     this._disposeObjects("__moveEffect", "__scaleEffect", "__mainEffect");
   }

});
