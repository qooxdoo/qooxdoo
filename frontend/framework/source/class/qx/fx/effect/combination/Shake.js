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
qx.Class.define("qx.fx.effect.combination.Shake",
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

    this._effects = {
      1 : new qx.fx.effect.core.Move(this._element),

      2 : new qx.fx.effect.core.Move(this._element),
      3 : new qx.fx.effect.core.Move(this._element),

      4 : new qx.fx.effect.core.Move(this._element),
      5 : new qx.fx.effect.core.Move(this._element),

      6 : new qx.fx.effect.core.Move(this._element)
    };
  },

  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {

    duration :
    {
      init : 0.5,
      refine : true
    },

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

    setup : function()
    {
      this.base(arguments);

      this._oldStyle = {
        top    : qx.bom.element.Location.getTop(this._element, "scroll"),
        left   : qx.bom.element.Location.getLeft(this._element, "scroll")
      };
    },

    start : function()
    {
      this.base(arguments);

      var distance = parseFloat(this.getDistance());
      var split = parseFloat(this.getDuration()) / 10.0;
      var counter = 0;

      this._effects[1].set({ x : distance,    y : 0, duration : split});
      this._effects[2].set({ x : -distance*2, y : 0, duration : split*2});
      this._effects[3].set({ x : distance*2,  y : 0, duration : split*2});
      this._effects[4].set({ x : -distance*2, y : 0, duration : split*2});
      this._effects[5].set({ x : distance*2,  y : 0, duration : split*2});
      this._effects[6].set({ x : -distance,   y : 0, duration : split*2});

      var effects = this._effects;

      for(var effect in this._effects)
      {
        counter++;
        this._effects[effect].id = counter;
        if (counter < 6)
        {
          this._effects[effect].afterFinishInternal = function(){
            effects[this.id + 1].start();
          };
        }
        else
        {
          effect.afterFinishInternal = function(){
            for(var property in this._oldStyle) {
              qx.bom.element.Style.set(this._element, property, this._oldStyle[property]);
            }
          };
        }
      }
      this._effects[1].start();

    }

   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function()
   {
     this._disposeObjectDeep("_effects", 1);
   }

});
