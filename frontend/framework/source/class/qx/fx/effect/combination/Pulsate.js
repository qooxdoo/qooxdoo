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
qx.Class.define("qx.fx.effect.combination.Pulsate",
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

    var duration = this.getDuration() / 6;

    this._fadeEffects = {
      1 : new qx.fx.effect.core.FadeOut(this._element),
      2 : new qx.fx.effect.core.FadeIn(this._element),
      3 : new qx.fx.effect.core.FadeOut(this._element),
      4 : new qx.fx.effect.core.FadeIn(this._element),
      5 : new qx.fx.effect.core.FadeOut(this._element),
      6 : new qx.fx.effect.core.FadeIn(this._element)
    };

    for(var effect in this._fadeEffects)
    {
      this._fadeEffects[effect].set({
        duration : duration,
        transition: qx.fx.Transition.sinoidal
      });
    }

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
      init : 2,
      refine : true
    }

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
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function()
   {
     this._disposeObjectDeep("_fadeEffects", 1);
   }

});
