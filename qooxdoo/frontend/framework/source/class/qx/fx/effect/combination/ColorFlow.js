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
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {
  
    startColor :
    {
      init   : "#ffffff",
      check : "Color"
    },

    endColor :
    {
      init   : "#ffffaa",
      check : "Color"
    },

    forwardTransition :
    {
      init   : null,
      check : "Function"
    },
    
    backwardTransition :
    {
      init   : null,
      check : "Function"
    },
    
    forwardDuration :
    {
      init   : 1.0,
      check : "Number"
    },
    
    backwardDuration :
    {
      init   : 1.0,
      check : "Number"
    },
    
    delayBetween :
    {
      init   : 0.3,
      check : "Number"
    }

  },


  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element)
  {
    this.base(arguments, element);
    this.setForwardTransition(qx.fx.Transition.linear);
    this.setBackwardTransition(qx.fx.Transition.linear);

    this._highlightEffects = {
      1 : new qx.fx.effect.core.Highlight(this._element),
      2 : new qx.fx.effect.core.Highlight(this._element)
    };

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
      this.base(arguments);

      var counter = 0;
      var highlightEffectsReference = this._highlightEffects;
      var delay = this.getDelayBetween() * 1000;

     
      this._highlightEffects[1].set({
        startColor   : this.getStartColor(),
        endColor     : this.getEndColor(),
        duration     : this.getForwardDuration(),
        transition   : this.getForwardTransition(),
        restoreColor : false
      });

      this._highlightEffects[2].set({
        startColor   : this.getEndColor(),
        endColor     : this.getStartColor(),
        duration     : this.getBackwardDuration(),
        transition   : this.getBackwardTransition(),
        restoreColor : false
      });

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
