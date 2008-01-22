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

#module(core)

************************************************************************ */

/**
 * TODO
 */
qx.Class.define("qx.fx.ScopedQueue",
{

	extend : qx.core.Object,
	
  /*
	  *****************************************************************************
	     CONSTRUCTOR
	  *****************************************************************************
  */

  construct : function(element, options)
  {
    this.base(arguments);
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

		_effects  : [],
		_interval : null,

	  _each: function(iterator)
	  {
		  //this.effects._each(iterator);
	  },
	  
	  add: function(effect)
	  {
  		var timestamp = new Date().getTime();
  		
  		var position = (typeof(effect._options.queue) == "string") ? 
  		  effect._options.queue : effect._options.queue.position;

  		switch(position)
  		{
  		  case qx.fx.Effect.EffectPosition.front:
    			// move unstarted effects after this effect
    		  /*
    			this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {
    				e.startOn  += effect.finishOn;
    				e.finishOn += effect.finishOn;
    			  });
    			*/
  		    var idleEffects = qx.lang.Array.findAll(this._effects, function(e){ return e.state == qx.fx.EffectState.idle });
  		    for(var i in idleEffects)
  		    {
  		      idleEffects[i]._startOn  += effect._finishOn;
  		      idleEffects[i]._finishOn += effect._finishOn;
  		    }
  			break;

  		  case qx.fx.Effect.EffectPosition.withLast:
  		    //timestamp = this.effects.pluck('startOn').max() || timestamp;
  		    timestamp = qx.lang.Array.max(qx.lang.Array.pluck(this._effects, 'startOn'))  || timestamp;
  			break;

  		  case qx.fx.Effect.EffectPosition.end:
    			// start effect after last queued effect has finished
    			//timestamp = this.effects.pluck('finishOn').max() || timestamp;
          timestamp = qx.lang.Array.max(qx.lang.Array.pluck(this._effects, 'finishOn')) || timestamp;
  			break;

  		}

  		effect._startOn  += timestamp;
  		effect._finishOn += timestamp;
  	
  		if (!effect._options.queue.limit || (this._effects.length < effect._options.queue.limit))
  		  this._effects.push(effect);
  		
  		if (!this._interval)
  		{
  		  ///this.interval = setInterval(this.loop.bind(this), 15);
  		  this._interval = qx.lang.Function.periodical(this.loop, 15, this); // second "this" needed?
  		}
	  },

	  remove : function(effect)
	  {
  		//this.effects = this.effects.reject(function(e) { return e==effect });
	    this._effects = qx.lang.Array.reject(this._effects, function(e) { return e==effect });
	    
  		if (this._effects.length == 0) {
  		  window.clearInterval(this._interval);
  		  this._interval = null;
  		}
	  },

	  loop: function()
	  {
  		var timePos = new Date().getTime();
  		for(var i=0, len=this._effects.length;i<len;i++)
  		{
  		  this._effects[i] && this._effects[i].loop(timePos);
  	  }
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
