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
 * Combination effect "Shrink"
 *
 * The given element will be resized from initial dimensions to
 * final dimensions.
 */

qx.Class.define("qx.fx.effect.combination.Shrink",
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
     * Direction in which the element should shrink.
     */
    direction :
    {
      init : "center",
      check : [ "top-left", "top-right", "bottom-left", "bottom-right",  "center" ]
    },

    /**
     * Transition function to modify the movment process.
     */
    moveTransition :
    {
      init : "sinodial",

      // keep this in sync with qx.fx.Transition!
      check  : ["linear", "easeInQuad", "easeOutQuad", "sinodial", "reverse", "flicker", "wobble", "pulse", "spring", "none", "full"]
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

     __oldStyle : null,
     __moveEffect : null,
     __scaleEffect : null,
     __mainEffect : null,

    setup : function()
    {
      this.base(arguments);

      qx.bom.element.Style.set(this._getElement(), "overflow", "hidden");
    },

    afterFinishInternal : function()
    {
      this.base(arguments);
      var element = this._getElement();

      qx.bom.element.Style.set(element, "overflow", "visible");

      var value;
      for (var property in this.__oldStyle)
      {
        value = this.__oldStyle[property];
        if(property != "overflow"){
          value += "px";
        }
        qx.bom.element.Style.set(element, property, value);
      }

      if (this.getModifyDisplay()) {
        qx.bom.element.Style.set(element, "display", "none");
      }
    },

    start : function()
    {
      if (!this.base(arguments)) {
        return;
      }

      var element = this._getElement();
      var moveX, moveY;

      this.__oldStyle = {
        top      : qx.bom.element.Location.getTop(element, "scroll"),
        left     : qx.bom.element.Location.getLeft(element, "scroll"),
        width    : qx.bom.element.Dimension.getWidth(element),
        height   : qx.bom.element.Dimension.getHeight(element),
        opacity  : qx.bom.element.Style.get(element, "opacity")
      };


      switch (this.getDirection())
      {

        case 'top-left':
          moveX = moveY = 0;
        break;

        case 'top-right':
          moveX = this.__oldStyle.width;
          moveY = 0;
        break;

        case 'bottom-left':
          moveX = 0;
          moveY = this.__oldStyle.height;
        break;

        case 'bottom-right':
          moveX = this.__oldStyle.width;
          moveY = this.__oldStyle.height;
        break;

        case 'center':
          moveX = this.__oldStyle.width / 2;
          moveY = this.__oldStyle.height / 2;
        break;

      }

      this.__moveEffect.set({
        x: moveX,
        y: moveY,
        sync: true,
        transition: this.getMoveTransition()
      });

      this.__scaleEffect.set({
        scaleTo : 0,
        sync: true,
        transition: this.getScaleTransition(),
        restoreAfterFinish: true
      });

      this.__mainEffect.start();

    }

   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this._disposeObjects("__moveEffect", "__scaleEffect", "__mainEffect");
   }
});
