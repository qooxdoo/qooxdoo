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

    var initialMoveX, initialMoveY;
    var moveX, moveY;

    var effectSpecificOptions = {
      direction         : 'center',
      moveTransition    : qx.fx.Transition.sinoidal,
      scaleTransition   : qx.fx.Transition.sinoidal,
      opacityTransition : qx.fx.Transition.full
    };

    var dims = {
      width  : qx.bom.element.Dimension.getWidth(element),
      height : qx.bom.element.Dimension.getHeight(element)
    };

    this._oldStyle = {
      top     : qx.bom.element.Location.getTop(element),
      left    : qx.bom.element.Location.getLeft(element),
      width   : qx.bom.element.Dimension.getWidth(element),
      height  : qx.bom.element.Dimension.getHeight(element)
    };

    this._element = element;
    
    for(var i in effectSpecificOptions)
    {
      if (typeof(options[i]) == "undefined") {
        options[i] = effectSpecificOptions[i];
      }
    }

    switch (options.direction)
    {

      case 'top-left':
        initialMoveX = initialMoveY = moveX = moveY = 0; 
      break;

      case 'top-right':
        initialMoveX = dims.width;
        initialMoveY = moveY = 0;
        moveX = -dims.width;
      break;

      case 'bottom-left':
        initialMoveX = moveX = 0;
        initialMoveY = dims.height;
        moveY = -dims.height;
      break;

      case 'bottom-right':
        initialMoveX = dims.width;
        initialMoveY = dims.height;
        moveX = -dims.width;
        moveY = -dims.height;
      break;

      case 'center':
        initialMoveX = Math.round(dims.width / 2);
        initialMoveY = Math.round(dims.height / 2);
        moveX = -Math.round(dims.width / 2);
        moveY = -Math.round(dims.height / 2);
      break;

    }

    this.base(arguments, element, options);


    var fadeInEffect = new qx.fx.effect.core.FadeIn(
      element,
      {
        sync: true,
        transition: options.opacityTransition
      }
    );

    var moveEffect = new qx.fx.effect.core.Move(
      element,
      {
        x: moveX,
        y: moveY,
        sync: true,
        transition: options.moveTransition
      }
    );

    var scaleEffect = new qx.fx.effect.core.Scale(
      element,
      100,
      {
      scaleMode: {
        originalHeight: dims.height,
        originalWidth: dims.width
      }, 
      sync: true,
      scaleFrom : 0,
      transition: options.scaleTransition
      }
    );

    this._effect = new qx.fx.effect.core.Move(
      element,
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

    beforeSetup : function(effect)
    {
      console.info(
        "start: ",
        qx.bom.element.Location.getTop(this._element),
        qx.bom.element.Location.getLeft(this._element)
      );

      qx.bom.element.Style.set(this._element, "overflow", "hidden");
      qx.bom.element.Style.set(this._element, "height", "0px");
      qx.bom.element.Style.set(this._element, "width", "0px");
    },


    afterFinishInternal : function(effect)
    {
      qx.bom.element.Style.set(this._element, "overflow", "visible");

      for(var property in this._oldStyle)
      {
        //if( (qx.bom.client.Engine.MSHTML) && ( (property == "left") || (property == "top") ) && (this._oldStyle[property] != "0") ) 
        //{
          qx.bom.element.Style.set(this._element, property, this._oldStyle[property]);
          //}
      }
    },

    start : function()
    {
      this.base(arguments);
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

