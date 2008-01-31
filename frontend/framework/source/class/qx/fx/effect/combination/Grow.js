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
qx.Class.define("qx.fx.effect.combination.Grow",
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
      direction         : 'center',
      moveTransition    : qx.fx.Transition.sinoidal,
      scaleTransition   : qx.fx.Transition.sinoidal,
      opacityTransition : qx.fx.Transition.full
    };

    for(var i in effectSpecificOptions)
    {
      if (typeof(options[i]) == "undefined") {
        options[i] = effectSpecificOptions[i];
      }
    }

    this.base(arguments, element, options);
    this._element = element;

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
      qx.bom.element.Style.set(this._element, "overflow", "hidden");
      qx.bom.element.Style.set(this._element, "height", "0px");
      qx.bom.element.Style.set(this._element, "width", "0px");
    },

    afterFinishInternal : function(effect)
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
        top     : qx.bom.element.Location.getTop(this._element, "scroll"),
        left    : qx.bom.element.Location.getLeft(this._element, "scroll"),
        width   : qx.bom.element.Dimension.getWidth(this._element),
        height  : qx.bom.element.Dimension.getHeight(this._element)
      };


      switch (this._options.direction)
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

      var fadeInEffect = new qx.fx.effect.core.FadeIn(
        this._element,
        {
          sync: true,
          transition: this._options.opacityTransition
        }
      );

      var moveEffect = new qx.fx.effect.core.Move(
        this._element,
        {
          x: moveX,
          y: moveY,
          sync: true,
          transition: this._options.moveTransition
        }
      );

      var scaleEffect = new qx.fx.effect.core.Scale(
        this._element,
        100,
        {
          scaleMode: {
            originalHeight: this._oldStyle.height,
            originalWidth: this._oldStyle.width
          }, 
          sync: true,
          scaleFrom : 0,
          transition: this._options.scaleTransition
        }
      );

      this._effect = new qx.fx.effect.core.Move(
        this._element,
        {
          x : initialMoveX,
          y : initialMoveY,
          duration: 0.01
        }
      );

      this._effect.afterFinishInternal = function(effect)
      {
        new qx.fx.effect.core.Parallel(
          {
            1 : fadeInEffect,
            2 : moveEffect,
            3 : scaleEffect
          }
        ).start();
      };

      this._effect.start();
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

