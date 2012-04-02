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
     * Jonathan Weiß (jonathan_rass)

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
 * Combination effect "Pulsate"
 *
 * Fades the element in and out several times.
 * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
 */

qx.Class.define("qx.fx.effect.combination.Pulsate",
{

  extend : qx.fx.Base,

  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  /**
   * @param element {Object} The DOM element
   * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
   */
  construct : function(element)
  {
    this.base(arguments, element);

    var duration = this.getDuration() / 6;
    var counter = 0;

    this.__fadeEffects = [
      new qx.fx.effect.core.Fade(element),
      new qx.fx.effect.core.Fade(element),
      new qx.fx.effect.core.Fade(element),
      new qx.fx.effect.core.Fade(element),
      new qx.fx.effect.core.Fade(element),
      new qx.fx.effect.core.Fade(element)
    ];

    for (var i=0, l=this.__fadeEffects.length; i<l; i++)
    {
      this.__fadeEffects[i].set({
        duration : duration,
        to : ( (counter % 2) != 0) ? 1 : 0,
        from : ( (counter % 2) != 0) ? 0 : 1,
        transition: "sinodial",
        modifyDisplay : false
      });
      counter++;
    }

  },


  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {

    /**
     * Number of seconds the effect should run.
     * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
     */
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

    __oldValue : null,
    __fadeEffects : null,
    __notRunEffects : null,
    __triggerFinish : false,

    beforeSetup : function() {
      this.__oldValue = qx.bom.element.Style.get(this._getElement(), "opacity");
    },


    start : function()
    {
      if (!this.base(arguments)) {
        return;
      }

      this.__notRunEffects = [];
      this.__triggerFinish = false;

      var counter = 0;
      var self = this;

      for (var i=0, l=this.__fadeEffects.length; i<l; i++)
      {
        this.__fadeEffects[i].id = counter;
        this.__notRunEffects.push(this.__fadeEffects[i]);

        this.__fadeEffects[i].afterFinishInternal = function()
        {
          qx.lang.Array.remove(self.__notRunEffects, this);

          // start the sub animations - the first 5
          if (this.id < 5)
          {
            self.__fadeEffects[this.id + 1].start();
          }
          else
          {
            // last animation should trigger the finish methods if not already done
            if (self.__triggerFinish) {
              self.end();
            }
          }
        }

        counter++;
      }
      this.__fadeEffects[0].start();
    },

    // overwritten
    // to be able to control the end of the sub animations
    // if the sub animations are not finished the pulsate animation itself
    // should not signal the end. Otherwise a sub animation is still running
    // after the "finish" event of the Pulsate animation is fired
    end : function()
    {
      if (this.__notRunEffects.length == 0)
      {
        this.base(arguments);
      }
      else
      {
        this.__triggerFinish = true;
      }
    },


    afterFinish : function()
    {
      qx.bom.element.Style.set(this._getElement(), "opacity", this.__oldValue);
    },

    _applyDuration: function(value, old) {
      var effectDuration = value / 6;

      for (var i=0, l=this.__fadeEffects.length; i<l; i++)
      {
        this.__fadeEffects[i].set({
          duration : effectDuration
        });
      }
     },

    /**
    * Cancels the member effects first and then cancels itself.
    * @deprecated since 2.0: Please use qx.bom.element.Animation instead.
    */
    cancel : function()
    {
      for (var i=0, l=this.__notRunEffects.length; i<l; i++)
      {
        this.__notRunEffects[i].cancel();
      }
      this.base(arguments);
    }

   },

   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this._disposeArray("__fadeEffects");
     this._disposeArray("__notRunEffects");
   }
});
