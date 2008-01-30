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
qx.Class.define("qx.fx.Grow",
{

  extend : qx.fx.Base,
  
  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element, options)
  {

    var opacity = qx.bom.element.Style.get(element, "opacity");
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
      opacity : qx.util.Validation.isValidNumber(opacity) ? opacity : 1.0,
      top     : qx.bom.element.Location.getTop(element, "scroll"),
      left    : qx.bom.element.Location.getLeft(element, "scroll"),
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
        initialMoveX = dims.width / 2;
        initialMoveY = dims.height / 2;
        moveX = -dims.width / 2;
        moveY = -dims.height / 2;
      break;

    }


    this.base(arguments, element, options);


    var fadeInEffect = new qx.fx.FadeIn(
      element,
      {
        sync: true,
        transition: options.opacityTransition
      }
    );

    var moveEffect = new qx.fx.Move(
      element,
      {
        x: moveX,
        y: moveY,
        sync: true,
        transition: options.moveTransition
      }
    );

    var scaleEffect = new qx.fx.Scale(
      element,
      100,
      {
      scaleMode: {
        originalHeight: dims.height,
        originalWidth: dims.width
      }, 
      sync: true,
      //scaleFrom: window.opera ? 1 : 0,
      scaleFrom : 0,
      transition: options.scaleTransition
      //restoreAfterFinish: true
      }
    );

    this._effect = new qx.fx.Move(
      element,
      {
        x : initialMoveX,
        y : initialMoveY,
        duration: 0.01, 
        beforeSetup : function(effect)
        {
          //effect.element.hide().makeClipping().makePositioned();
          qx.bom.element.Style.set(element, "display", "none");
          qx.bom.element.Style.set(element, "overflow", "auto");
        }
      }
    );

    this._effect.afterFinishInternal = function(effect)
    {
      new qx.fx.Parallel(
        {
          1 : fadeInEffect,
          2 : moveEffect,
          3 : scaleEffect
        }
      ).start();
    };


/*
, Object.extend({
             beforeSetup: function(effect) {
               effect.effects[0].element.setStyle({height: '0px'}).show(); 
             },
             afterFinishInternal: function(effect) {
               effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle); 
             }
           }, options) 
 */
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
      //effect.effects[0].element.setStyle({height: '0px'}).show();
      //effect.element.hide().makeClipping().makePositioned();
      qx.bom.element.Style.set(this._element, "height", "0px");
      qx.bom.element.Style.set(this._element, "width", "0px");
      qx.bom.element.Style.set(this._element, "display", "block");
    },


    afterFinishInternal: function(effect)
    {
      qx.bom.element.Style.set(this._element, "overflow", "visible");
      //effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle);
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

