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

    beforeSetup : function() {
      this.__oldValue = qx.bom.element.Style.get(this._getElement(), "opacity");
    },


    start : function()
    {
      if (!this.base(arguments)) {
        return;
      }

      this.__notRunEffects = [];

      var counter = 0;
      var self = this;

      for (var i=0, l=this.__fadeEffects.length; i<l; i++)
      {
        this.__fadeEffects[i].id = counter;
        this.__notRunEffects.push(this.__fadeEffects[i]);
        if (counter < 5)
        {
          this.__fadeEffects[i].afterFinishInternal = function(){
            qx.lang.Array.remove(self.__notRunEffects, this);
            self.__fadeEffects[this.id + 1].start();
          };
        }
        counter++;
      }
      this.__fadeEffects[0].start();
    },


    afterFinish : function() {
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
