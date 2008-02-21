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
 * Basic class for all core and combination effects.
 */
qx.Class.define("qx.fx.Base",
{

  extend : qx.core.Object,

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
    this.base(arguments);
    
    this.setQueue( qx.fx.queue.Manager.getInstance().getDefaultQueue() );

    this.setTransition(qx.fx.Transition.linear);
    this._element = element;

    this.init();
  },


  /*
   *****************************************************************************
      EVENTS
   *****************************************************************************
   */

   events:
   {
     /**
      * This event is fired when effect starts.
      */
     "setup"  : "qx.event.type.Event",

     /**
      * This event is fired every time a frame is rendered.
      */
     "update" : "qx.event.type.Event",

     /**
      * This event is fired when effect ends.
      */
      "finish" : "qx.event.type.Event"
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
       init   : 1.0,
       check  : "Number"
     },

     /**
      * Number frames per seconds the effect should be rendered with.
      */
     fps :
     {
       init   : 100,
       check  : "Number"
     },

     /**
      * Flag indicating if effect should run parallel with others.
      */
     sync :
     {
       init   : false,
       check  : "Boolean"
     },

     /**
      * Initial value of effect-specific property (color, opacity, position, etc.).
      */
     from :
     {
       init   : 0,
       check  : "Number"
     },

     /**
      * End value of effect-specific property. When this value is reached, the effect will end.
      */
     to :
     {
       init   : 1,
       check  : "Number"
     },

     /**
      * Number of seconds the effect should wait before start.
      */
     delay :
     {
       init   : 0.0,
       check  : "Number"
     },

     /**
      * Name of queue the effect should run in.
      */
     queue :
     {
       check : "Object"
     },

     /**
      * Function which modifies the effect-specific property during the transtion
      * between "from" and "to" value.
      */
     transition :
     {
       init   : null,
       //check  : ["linear", "easeInQuad", "easeOutQuad", "sinoidal", "reverse", "flicker", "wobble", "pulse", "spring", "none", "full"]
       check : "Function"
     }

  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    EffectState :
    {
      IDLE     : 'idle',
      FINISHED : 'finished',
      RUNNING  : 'running'
    }

  },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

  members :
  {

    
    init : function()
    {
      this._currentFrame = 0;
      this._state        = qx.fx.Base.EffectState.IDLE;
      this._startOn      = this.getDelay() * 1000;
      this._finishOn     = this._startOn + (this.getDuration() * 1000);
      this._fromToDelta  = this.getTo() - this.getFrom();
      this._totalTime    = this._finishOn - this._startOn;
      this._totalFrames  = this.getFps() * this.getDuration();
    },

    beforeFinishInternal : function(){},
    beforeFinish : function(){},
    afterFinishInternal : function(){},
    afterFinish : function(){},

    beforeSetupInternal : function(){},
    beforeSetup : function(){},
    afterSetupInternal : function(){},
    afertSetup : function(){},

    beforeUpdateInternal : function(){},
    beforeUpdate : function(){},
    afterUpdateInternal : function(){},
    afterUpdate : function(){},

    beforeStartInternal : function(){},
    beforeStart : function(){},


    setup : function() {
      this.fireEvent("setup");
    },


    update : function()
    {
      if (this.hasListeners()) {
        this.fireEvent("update");
      }
    },


    finish  : function() {
      this.fireEvent("finish");
    },


    start : function()
    {

      if(this._state == qx.fx.Base.EffectState.RUNNING) {
        this.end();
      }

      this.init();

      this.beforeStartInternal();
      this.beforeStart();

      if (!this.getSync()) {
        var queue = this.getQueue(queue).add(this);
      }

    },


    end : function()
    {
      this.render(1.0);
      this.cancel();

      this.beforeFinishInternal();
      this.beforeFinish();

      this.finish();

      this.afterFinishInternal();
      this.afterFinish();
    },


    render : function(pos)
    {
      if(this._state == qx.fx.Base.EffectState.IDLE)
      {
        this._state = qx.fx.Base.EffectState.RUNNING

        this.beforeSetupInternal();
        this.beforeSetup();

        this.setup();

        this.afterSetupInternal();
        this.afertSetup();
      }

      if(this._state == qx.fx.Base.EffectState.RUNNING)
      {
        this._position = this.getTransition()(pos) * this._fromToDelta + this.getFrom();

        this.beforeUpdateInternal();
        this.beforeUpdate();

        this.update(this._position);

        this.afterUpdateInternal();
        this.afterUpdate();
      }
    },


    loop : function(timePos)
    {
      if (timePos >= this._startOn)
      {

        if (timePos >= this._finishOn)
        {
          this.end();
        }

        var pos   = (timePos - this._startOn) / this._totalTime;
        var frame = Math.round(pos * this._totalFrames);

        if (frame > this._currentFrame)
        {
          this.render(pos);
          this._currentFrame = frame;
        }

      }
    },


    cancel : function()
    {
      if (!this.getSync()) {
        this.getQueue().remove(this);
      }

      this._state = qx.fx.Base.EffectState.FINISHED;
    }


  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("_element");
  }

});
