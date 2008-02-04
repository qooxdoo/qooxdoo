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
qx.Class.define("qx.fx.effect.combination.ColorFlow",
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
      startColor         : "#ffffff",
      endColor           : "#ffffaa",
      forwardTransition  : qx.fx.Transition.linear,
      backwardTransition : qx.fx.Transition.linear,
      forwardDuration    : 1.0,
      backwardDuration   : 1.0,
      delayBetween       : 0.3
    };
  
    for(var i in effectSpecificOptions)
    {
      if (typeof(options[i]) == "undefined") {
        options[i] = effectSpecificOptions[i];
      }
    }
    this.base(arguments, element, options);
    this._element = element;

    this._highlightEffects = {
      1 : new qx.fx.effect.core.Highlight(
        this._element,
        {
          startColor   : this._options.startColor,
          endColor     : this._options.endColor,
          duration     : this._options.forwardDuration,
          transition   : this._options.forwardTransition,
          restoreColor : false
        }
      ),
      2 : new qx.fx.effect.core.Highlight(
        this._element,
        {
          startColor   : this._options.endColor,
          endColor     : this._options.startColor,
          duration     : this._options.backwardDuration,
          transition   : this._options.backwardTransition,
          restoreColor : false
        }
      )
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

    start : function()
    {
      var counter = 0;
      var highlightEffectsReference = this._highlightEffects;
      var delay = this._options.delayBetween*1000;

      for(var effect in this._highlightEffects)
      {
        counter++;
        this._highlightEffects[effect].id = counter;
        if (counter == 1)
        {
          this._highlightEffects[effect].afterFinishInternal = function(){
            if (delay > 0) {
              qx.lang.Function.delay(highlightEffectsReference[2].start, delay, highlightEffectsReference[2]);
            } else {
              highlightEffectsReference[2].start();
            }
          };
        }
        this._highlightEffects[effect].finish = function(){};

      }
      this._highlightEffects[1].start();      

      this.base(arguments);
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
