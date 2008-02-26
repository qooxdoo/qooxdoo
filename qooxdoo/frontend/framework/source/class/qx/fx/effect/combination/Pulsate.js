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
 * Combination effect "Pulsate"
 *
 * The given element faded in and out several times.
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

    this._fadeEffects = [
      new qx.fx.effect.core.Fade(this._element),
      new qx.fx.effect.core.Fade(this._element),
      new qx.fx.effect.core.Fade(this._element),
      new qx.fx.effect.core.Fade(this._element),
      new qx.fx.effect.core.Fade(this._element),
      new qx.fx.effect.core.Fade(this._element)
    ];

    for (var i=0, l=this._fadeEffects.length; i<l; i++)
    {
      this._fadeEffects[i].set({
        duration : duration,
        to : ( (counter % 2) != 0) ? 1 : 0,
        from : ( (counter % 2) != 0) ? 0 : 1,
        transition: "sinoidal",
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
    
    beforeSetup : function()
    {
      this._oldValue = qx.bom.element.Style.get(this._element, "opacity");
    },


    start : function()
    {
      this.base(arguments);

      var counter = 0;
      var self = this;

      for (var i=0, l=this._fadeEffects.length; i<l; i++)
      {
        this._fadeEffects[i].id = counter;
        if (counter < 5)
        {
          this._fadeEffects[i].afterFinishInternal = function(){
            self._fadeEffects[this.id + 1].start();
          };
        }
        counter++;
      }
      this._fadeEffects[0].start();
    },


    afterFinish : function() {
      qx.bom.element.Style.set(this._element, "opacity", this._oldValue);
    }

   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function() {
     this._disposeArray("_fadeEffects");
   }
});
