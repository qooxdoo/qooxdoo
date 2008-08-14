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
 * Combination effect "Shake"
 *
 * The given element will be moved forwards and backwards
 * several times.
 */
qx.Class.define("qx.fx.effect.combination.Shake",
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

    this.__effects = [
      new qx.fx.effect.core.Move(element),
      new qx.fx.effect.core.Move(element),
      new qx.fx.effect.core.Move(element),
      new qx.fx.effect.core.Move(element),
      new qx.fx.effect.core.Move(element),
      new qx.fx.effect.core.Move(element)
    ];
  },

  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {
    /**
     * Direction in which the element should be shaken.
     */
    direction :
    {
      init : "horizontal",
      check : [ "horizontal", "vertical" ]
    },

    /**
     * Number of seconds the effect should run.
     */
    duration :
    {
      init : 0.5,
      refine : true
    },

    /**
     * Amount of pixel the element should be moved during the shake.
     */
    distance :
    {
      init : 20,
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

     __effects : null,

    start : function()
    {
      if (!this.base(arguments)) {
        return;
      }
      var element = this._getElement();

      var oldStyle = {
        top  : qx.bom.element.Location.getTop(element),
        left : qx.bom.element.Location.getLeft(element)
      };


      var distance = parseFloat(this.getDistance());
      var split = parseFloat(this.getDuration()) / 10.0;

      if(this.getDirection() == "horizontal")
      {
        this.__effects[0].set({ x : distance,    y : 0, duration : split});
        this.__effects[1].set({ x : -distance*2, y : 0, duration : split*2});
        this.__effects[2].set({ x : distance*2,  y : 0, duration : split*2});
        this.__effects[3].set({ x : -distance*2, y : 0, duration : split*2});
        this.__effects[4].set({ x : distance*2,  y : 0, duration : split*2});
        this.__effects[5].set({ x : -distance,   y : 0, duration : split*2});
      }
      else if(this.getDirection() == "vertical")
      {
        this.__effects[0].set({ y : distance,    x : 0, duration : split});
        this.__effects[1].set({ y : -distance*2, x : 0, duration : split*2});
        this.__effects[2].set({ y : distance*2,  x : 0, duration : split*2});
        this.__effects[3].set({ y : -distance*2, x : 0, duration : split*2});
        this.__effects[4].set({ y : distance*2,  x : 0, duration : split*2});
        this.__effects[5].set({ y : -distance,   x : 0, duration : split*2});
      }

      var effects = this.__effects;
      for (var i=0, len=this.__effects.length; i<len; i++)
      {
        this.__effects[i].id = i;
        if (i < 5)
        {
          this.__effects[i].afterFinishInternal = function(){
            effects[this.id + 1].start();
          };
        }
        else
        {
          this.__effects[i].afterFinishInternal = function(){
            for(var property in oldStyle) {
              qx.bom.element.Style.set(this._getElement(), property, (oldStyle[property] + "px"));
            }
          };
        }

      }
      this.__effects[0].start();

    }

   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this._disposeArray("__effects");
   }
});
