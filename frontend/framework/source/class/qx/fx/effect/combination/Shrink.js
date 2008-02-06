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
qx.Class.define("qx.fx.effect.combination.Shrink",
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
      opacityTransition : qx.fx.Transition.sinoidal
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

    setup : function()
    {
      this.base(arguments);

      qx.bom.element.Style.set(this._element, "overflow", "hidden");
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

      var moveX, moveY;

      this._oldStyle = {
        top    : qx.bom.element.Location.getTop(this._element, "scroll"),
        left   : qx.bom.element.Location.getLeft(this._element, "scroll"),
        width  : qx.bom.element.Dimension.getWidth(this._element),
        height : qx.bom.element.Dimension.getHeight(this._element)
      };

      switch (this._options.direction)
      {

        case 'top-left':
          moveX = moveY = 0;
        break;

        case 'top-right':
          moveX = this._oldStyle.width;
          moveY = 0;
        break;

        case 'bottom-left':
          moveX = 0;
          moveY = this._oldStyle.height;
        break;

        case 'bottom-right':
          moveX = this._oldStyle.width;
          moveY = this._oldStyle.height;
        break;

        case 'center':
          moveX = this._oldStyle.width / 2;
          moveY = this._oldStyle.height / 2;
        break;

      }

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
        0,
        {
          scaleMode: {
            originalHeight: this._oldStyle.height,
            originalWidth: this._oldStyle.width
          },
          sync: true,
          transition: this._options.scaleTransition,
          restoreAfterFinish: true
        }
      );

      this._effect = new qx.fx.effect.core.Parallel(
        {
          1 : moveEffect,
          2 : scaleEffect
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

