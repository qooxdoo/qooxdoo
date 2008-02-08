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
qx.Class.define("qx.fx.effect.combination.Grow",
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

    this.setScaleTransition(qx.fx.Transition.sinoidal);
    this.setMoveTransition(qx.fx.Transition.sinoidal);

    this._moveEffect = new qx.fx.effect.core.Move(this._element);
    this._scaleEffect = new qx.fx.effect.core.Scale(this._element);
    this._mainEffect = new qx.fx.effect.core.Move(this._element);

    var parallelEffect = new qx.fx.effect.core.Parallel([
      this._moveEffect,
      this._scaleEffect
    ]);

    this._mainEffect.afterFinishInternal = function(effect) {
      parallelEffect.start();
    };
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
      init : "center",
      check : [ "top-left", "top-right", "bottom-left", "bottom-right",  "center" ]
    },

    scaleTransition :
    {
      init : null,
      check : "Function"
    },

    moveTransition :
    {
      init : null,
      check : "Function"
    }

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

      qx.bom.element.Style.set(this._element, "overflow", "hidden");
      qx.bom.element.Style.set(this._element, "height", "0px");
      qx.bom.element.Style.set(this._element, "width", "0px");
    },

    afterFinishInternal : function()
    {
      qx.bom.element.Style.set(this._element, "overflow", "visible");

      for (var property in this._oldStyle) {
        qx.bom.element.Style.set(this._element, property, this._oldStyle[property]);
      }
    },

    start : function()
    {
      this.base(arguments);

      var initialMoveX, initialMoveY;
      var moveX, moveY;

      this._oldStyle = {
        top    : qx.bom.element.Location.getTop(this._element, "scroll"),
        left   : qx.bom.element.Location.getLeft(this._element, "scroll"),
        width  : qx.bom.element.Dimension.getWidth(this._element),
        height : qx.bom.element.Dimension.getHeight(this._element)
      };


      switch (this.getDirection())
      {
        case 'top-left':
          initialMoveX = initialMoveY = moveX = moveY = 0;
        break;

        case 'top-right':
          initialMoveX = this._oldStyle.width;
          initialMoveY = moveY = 0;
          moveX = -this._oldStyle.width;
        break;

        case 'bottom-left':
          initialMoveX = moveX = 0;
          initialMoveY = this._oldStyle.height;
          moveY = -this._oldStyle.height;
        break;

        case 'bottom-right':
          initialMoveX = this._oldStyle.width;
          initialMoveY = this._oldStyle.height;
          moveX = -this._oldStyle.width;
          moveY = -this._oldStyle.height;
        break;

        case 'center':
          initialMoveX = Math.round(this._oldStyle.width / 2);
          initialMoveY = Math.round(this._oldStyle.height / 2);
          moveX = -Math.round(this._oldStyle.width / 2);
          moveY = -Math.round(this._oldStyle.height / 2);
        break;
      }

      this._moveEffect.set({
        x: moveX,
        y: moveY,
        sync: true,
        transition: this.getMoveTransition()
      });

      this._scaleEffect.set({
        scaleTo : 100,
        scaleMode: {
          originalHeight: this._oldStyle.height,
          originalWidth: this._oldStyle.width
        },
        sync: true,
        scaleFrom : 0,
        transition: this.getScaleTransition()
      });

      this._mainEffect.set({
        x : initialMoveX,
        y : initialMoveY,
        duration: 0.01
      });

      this._mainEffect.start();
    }

   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function()
   {
     this._disposeObjects("_moveEffect", "_scaleEffect", "_mainEffect", "parallelEffect");
   }

});
