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
qx.Class.define("qx.fx.effect.combination.Pulsate",
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
        duration : 2
    };
  
    for(var i in effectSpecificOptions)
    {
      if (typeof(options[i]) == "undefined") {
        options[i] = effectSpecificOptions[i];
      }
    }
    this.base(arguments, element, options);

    var duration = this._options.duration / 6;

    this._fadeEffects = {
      1 : new qx.fx.effect.core.FadeOut(this._element, {duration : duration, transition: qx.fx.Transition.sinoidal}),
      2 : new qx.fx.effect.core.FadeIn(this._element,  {duration : duration, transition: qx.fx.Transition.sinoidal}),
      3 : new qx.fx.effect.core.FadeOut(this._element, {duration : duration, transition: qx.fx.Transition.sinoidal}),
      4 : new qx.fx.effect.core.FadeIn(this._element,  {duration : duration, transition: qx.fx.Transition.sinoidal}),
      5 : new qx.fx.effect.core.FadeOut(this._element, {duration : duration, transition: qx.fx.Transition.sinoidal}),
      6 : new qx.fx.effect.core.FadeIn(this._element,  {duration : duration, transition: qx.fx.Transition.sinoidal})
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
      this.base(arguments);

      var counter = 0;
      var fadeEffectsReference = this._fadeEffects;

      for(var effect in this._fadeEffects)
      {
        counter++;
        this._fadeEffects[effect].id = counter;
        if (counter < 6)
        {
          this._fadeEffects[effect].afterFinishInternal = function(){
            fadeEffectsReference[this.id + 1].start();
          };
        }
      }
      this._fadeEffects[1].start();      
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
