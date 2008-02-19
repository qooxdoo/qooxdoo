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
 * This queue manages ordering and rendering of effects.
 */
qx.Class.define("qx.fx.queue.Queue",
{

  extend : qx.core.Object,


  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */


  construct : function()
  {
    this.base(arguments);
  },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */


   members :
   {

    _effects  : [],
    _interval : null,

    /**
     * This method adds the given effect to the queue
     * and orders it based on its position.
     * @param effect {Object} The effect.
     */
    add: function(effect)
    {
      var timestamp = new Date().getTime();
      var position = (typeof(effect.getQueue()) == "string") ?  effect.getQueue() : effect.getQueue().position;

      effect._startOn  += timestamp;
      effect._finishOn += timestamp;

      if (!effect.getQueue().limit || (this._effects.length < effect.getQueue().limit)) {
        this._effects.push(effect)
      }

      if (!this._interval) {
        this._interval = qx.lang.Function.periodical(this.loop, 15, this);
      }
    },

    /**
     * This method removes the given effect from the queue.
     * @param effect {Object} The effect.
     */
    remove : function(effect)
    {
      //this.effects = this.effects.reject(function(e) { return e==effect });

      this._effects = qx.lang.Array.reject(this._effects, function(e) { return e == effect });

      if (this._effects.length == 0)
      {
        window.clearInterval(this._interval);
        this._interval = null;
      }
    },

    /**
     * This method executes all effects in queue.
     */
    loop: function()
    {
      var timePos = new Date().getTime();

      for (var i=0, len=this._effects.length; i<len; i++) {
        this._effects[i] && this._effects[i].loop(timePos);
      }

    }

   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function()
   {
     this._disposeFields("_effects");
   }

});

