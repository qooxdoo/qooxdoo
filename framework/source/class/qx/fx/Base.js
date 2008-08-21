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
    this.__state = qx.fx.Base.EffectState.IDLE;

    this.__element = element;
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
       init   : 0.5,
       check  : "Number",
       apply : "_applyDuration"
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
       init   : "linear",

       // keep this in sync with qx.fx.Transition!
       check  : ["linear", "easeInQuad", "easeOutQuad", "sinodial", "reverse", "flicker", "wobble", "pulse", "spring", "none", "full"]
     }

  },


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /**
     * State in which each effect can be
     */
    EffectState :
    {
      IDLE      : 'idle',
      PREPARING : 'preparing',
      FINISHED  : 'finished',
      RUNNING   : 'running'
    }

  },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

  members :
  {

    __state : null,
    __currentFrame : null,
    __startOn : null,
    __finishOn : null,
    __fromToDelta : null,
    __totalTime : null,
    __totalFrames : null,
    __position : null,
    __element : null,

    /**
     * Returns the effect's DOM element
     * @return {Object} the element
     */
    _getElement : function() {
      return this.__element;
    },

    /**
     * Sets the element to be animated.
     * @param element {Object} the element
     */
    _setElement : function(element) {
      this.__element = element;
    },

    /**
     * Apply method for duration. Should be overwritten if needed.
     * @param value {Number} Current value
     * @param old {Number} Previous value
     **/
    _applyDuration : function(value, old){},

    /**
     * This internal function is used to update
     * properties before the effect starts.
     */
    init : function()
    {
      this.__state        = qx.fx.Base.EffectState.PREPARING;
      this.__currentFrame = 0;
      this.__startOn      = this.getDelay() * 1000 + (new Date().getTime());
      this.__finishOn     = this.__startOn + (this.getDuration() * 1000);
      this.__fromToDelta  = this.getTo() - this.getFrom();
      this.__totalTime    = this.__finishOn - this.__startOn;
      this.__totalFrames  = this.getFps() * this.getDuration();
    },

    /**
     * This internal function is called before
     * "beforeFinished" and before the effect
     * actually ends.
     */
    beforeFinishInternal : function(){},

    /**
     * This internal function is called before
     * the effect actually ends.
     */
    beforeFinish : function(){},

    /**
     * This internal function is called before
     * "afterFinished" and after the effect
     * actually has ended.
     */
    afterFinishInternal : function(){},

    /**
     * This internal function is called after
     * the effect actually has ended.
     */
    afterFinish : function(){},

    /**
     * This internal function is called before
     * "beforeSetup" and before the effect's
     * "setup" method gets called.
     */
    beforeSetupInternal : function(){},

    /**
     * This internal function is called before
     * the effect's "setup" method gets called.
     */
    beforeSetup : function(){},

    /**
     * This internal function is called before
     * "afterSetup" and after the effect's
     * "setup" method has been called.
     */
    afterSetupInternal : function(){},

    /**
     * This internal function is after
     * the effect's "setup" method has been called.
     */
    afertSetup : function(){},


    /**
     * This internal function is called before
     * "beforeUpdateInternal" and each time before
     * the effect's "update" method is called.
     */
    beforeUpdateInternal : function(){},

    /**
     * This internal function is each time before
     * the effect's "update" method is called.
     */
    beforeUpdate : function(){},

    /**
     * This internal function is called before
     * "afterUpdate" and each time after
     * the effect's "update" method is called.
     */
    afterUpdateInternal : function(){},

    /**
     * This internal function is called
     * each time after the effect's "update" method is called.
     */
    afterUpdate : function(){},

    /**
     * This internal function is called before
     * "beforeStartInternal" and before the effect
     * actually starts.
     */
    beforeStartInternal : function(){},

    /**
     * This internal function is called
     * before the effect actually starts.
     */
     beforeStart : function(){},


   /**
    * This internal function is called
    * before the effect starts to configure
    * the element or prepare other effects.
    *
    * Fires "setup" event.
    *
    */
    setup : function() {
      this.fireEvent("setup");
    },


    /**
     * This internal function is called
     * each time the effect performs an
     * step of the animation.
     *
     * Sub classes will overwrite this to
     * perform the actual changes on element
     * properties.
     *
     * @param position {Number} Animation setup
     * as Number between 0 and 1.
     *
     */
    update : function(position)
    {
    },


    /**
     * This internal function is called
     * when the effect has finished.
     *
     * Fires "finish" event.
     *
     */
    finish  : function() {
      this.fireEvent("finish");
    },


    /**
     * Starts the effect
     */
    start : function()
    {

      if (this.__state != qx.fx.Base.EffectState.IDLE) {
        // Return a value to use this in overwritten start() methods
        return false;
      }

      this.init();

      this.beforeStartInternal();
      this.beforeStart();

      if (!this.getSync()) {
        this.getQueue().add(this);
      }

      return true;
    },


    /**
     * Ends the effect
     */
    end : function()
    {

      // render with "1.0" to have an intended finish state
      this.render(1.0);
      this.cancel();

      this.beforeFinishInternal();
      this.beforeFinish();

      this.finish();

      this.afterFinishInternal();
      this.afterFinish();
    },

    /**
     * Calls update(), or invokes the effect, if not running.
     *
     * @param pos {Number} Effect's step on duration between
     * 0 (just started) and 1 (finished). The longer the duration
     * is, the lower is each step.
     *
     * Fires "update" event.
     */
    render : function(pos)
    {

      if(this.__state == qx.fx.Base.EffectState.PREPARING)
      {
        this.__state = qx.fx.Base.EffectState.RUNNING

        this.beforeSetupInternal();
        this.beforeSetup();

        this.setup();

        this.afterSetupInternal();
        this.afertSetup();
      }

      if(this.__state == qx.fx.Base.EffectState.RUNNING)
      {

        // adjust position depending on transition function
        this.__position = qx.fx.Transition.get(this.getTransition())(pos) * this.__fromToDelta + this.getFrom();

        this.beforeUpdateInternal();
        this.beforeUpdate();

        this.update(this.__position);

        this.afterUpdateInternal();
        this.afterUpdate();

        if (this.hasListener("update")) {
          this.fireEvent("update");
        }
      }
    },


    /**
     * Invokes update() if effect's remaining duration is
     * bigger than zero, or ends the effect otherwise.
     *
     * @param timePos {Number} Effect's step on duration between
     * 0 (just started) and 1 (finished). The longer the duration
     * is, the lower is each step.
     */
    loop : function(timePos)
    {
      // check if effect should be rendered now
      if (timePos >= this.__startOn)
      {

        // check if effect effect finish
        if (timePos >= this.__finishOn) {
          this.end();
        }

        var pos   = (timePos - this.__startOn) / this.__totalTime;
        var frame = Math.round(pos * this.__totalFrames);

        // check if effect has to be drawn in this frame
        if (frame > this.__currentFrame)
        {
          this.render(pos);
          this.__currentFrame = frame;
        }

      }
    },


    /**
    * Removes effect from queue and sets state to finished.
    */
    cancel : function()
    {
      if (!this.getSync()) {
        this.getQueue().remove(this);
      }

      this.__state = qx.fx.Base.EffectState.IDLE;
    }


  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("__element");
  }

});
