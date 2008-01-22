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
qx.Class.define("qx.fx.Effect",
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
    Transitions :
    {
    
      linear: function(pos)
      {
        return pos;
      },
      
      sinoidal: function(pos)
      {
        return ( -Math.cos(pos * Math.PI) / 2 ) + 0.5;
      },
      
      reverse: function(pos)
      {
        return 1 - pos;
      },
      
      flicker: function(pos)
      {
        var pos = ( (-Math.cos(pos * Math.PI) / 4) + 0.75) + Math.random() / 4;
        return pos > 1 ? 1 : pos;
      },
      
      wobble: function(pos)
      {
        return ( -Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
      },
      
      pulse: function(pos, pulses)
      { 
        pulses = pulses || 5;
        return (
          Math.round((pos % (1/pulses)) * pulses) == 0 ? 
                Math.floor((pos * pulses * 2) - (pos * pulses * 2)) : 
            1 - Math.floor((pos * pulses * 2) - (pos * pulses * 2))
          );
      },
      
      spring: function(pos)
      {
        return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6)); 
      },
      
      none: function(pos)
      {
        return 0;
      },
      
      full: function(pos)
      {
        return 1;
      }
      
    },

    DefaultOptions :
    {
      duration:   1.0,   // seconds
      fps:        100,   // 100 = assume 66fps max.
      sync:       false, // true for combining
      from:       0.0,
      to:         1.0,
      delay:      0.0,
      queue:      'parallel'
    },
    
    EffectPosition :
    {
      front    : 'front',
      end      : 'end',
      withLast : 'with-last'
    },
    
    EffectState :
    {
      idle     : 'idle',
      finished : 'finished',
      running  : 'running'
    },
    
    Queues :
    {
      instances : {},
      get : function(queueName)
      {
        if (typeof(queueName) != "string")
        {
          return queueName;
        }
/*
      return this.instances.get(queueName) ||
        this.instances.set(queueName, new qx.fx.ScopedQueue());
*/
       if(typeof(this.instances[queueName]) == "object")
       {
         return this.instances[queueName];
       }
       else
       {
         return this.instances[queueName] = new qx.fx.ScopedQueue();
       }
     }

    }
    
  },

  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

   members :
   {

   },

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    
  }
});
