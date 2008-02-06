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
qx.Class.define("qx.fx.effect.combination.Shake",
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
      distance : 20,
      duration : 0.5
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

      this._oldStyle = {
        top    : qx.bom.element.Location.getTop(this._element, "scroll"),
        left   : qx.bom.element.Location.getLeft(this._element, "scroll")
      };
    },

    start : function()
    {
      this.base(arguments);

      var distance = parseFloat(this._options.distance);
      var split = parseFloat(this._options.duration) / 10.0;
      var counter = 0;

      var moveEffects = {
        1 : new qx.fx.effect.core.Move(this._element, { x : distance,    y : 0, duration : split}),

        2 : new qx.fx.effect.core.Move(this._element, { x : -distance*2, y : 0, duration : split*2}),
        3 : new qx.fx.effect.core.Move(this._element, { x : distance*2,  y : 0, duration : split*2}),

        4 : new qx.fx.effect.core.Move(this._element, { x : -distance*2, y : 0, duration : split*2}),
        5 : new qx.fx.effect.core.Move(this._element, { x : distance*2,  y : 0, duration : split*2}),

        6 : new qx.fx.effect.core.Move(this._element, { x : -distance,   y : 0, duration : split*2})
      };

      for(var effect in moveEffects)
      {
        counter++;
        moveEffects[effect].id = counter;
        if (counter < 6)
        {
          moveEffects[effect].afterFinishInternal = function(){
            moveEffects[this.id + 1].start();
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
      moveEffects[1].start();

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

