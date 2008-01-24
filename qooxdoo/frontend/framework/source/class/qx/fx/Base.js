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
qx.Class.define("qx.fx.Base",
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

    if(options && typeof(options.transition) != "function"){
      this._transition = qx.fx.Effect.Transitions.linear;
    } else {
      this._transition = options.transition;
    }

    this._options = qx.lang.Object.copy(qx.fx.Effect.DefaultOptions);
    for (var i in options) {
      this._options[i] = options[i];
    }


    this.init();
    this._element = element;

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

    init : function()
    {
      this._currentFrame = 0;
      this._state        = qx.fx.Effect.EffectState.idle;
      this._startOn      = this._options.delay * 1000;
      this._finishOn     = this._startOn + (this._options.duration * 1000);
      this._fromToDelta  = this._options.to - this._options.from;
      this._totalTime    = this._finishOn - this._startOn;
      this._totalFrames  = this._options.fps * this._options.duration;
    },    
    
    start : function()
    {

      if (this._state == qx.fx.Effect.EffectState.finished) {
        this.init();
      }
      
      if (this.beforeStartInternal) {
        this.beforeStartInternal();
      }

      if (this.beforeStart) {
        this.beforeStart();
      }

      if (!this._options.sync)
      {
        var queue = this._getQueue();
        qx.fx.Effect.Queues.get(queue).add(this);
      }
    },

    render : function(pos)
    {
      if(this._state == qx.fx.Effect.EffectState.idle)
      {
        this._state = qx.fx.Effect.EffectState.running

        if (this.beforeSetupInternal) {
          this.beforeSetupInternal();
        }

        if (this.beforeSetup) {
          this.beforeSetup();
        }

        if (this.setup) {
          this.setup();
        }

        if (this.afterSetupInternal) {
          this.afterSetupInternal();
        }

        if (this.afterSetup) {
          this.afertSetup();
        }

      }

      if(this._state == qx.fx.Effect.EffectState.running)
      {

        this._position = this._transition(pos) * this._fromToDelta + this._options.from;

        if (this.beforeUpdateInternal) {
          this.beforeUpdateInternal();
        }
        
        if (this.beforeUpdate) {
          this.beforeUpdate();
        }

        if (this.update) {
          this.update(this._position);
        }

        if (this.afterUpdateInternal) {
          this.afterUpdateInternal();
        }

        if (this.afterUpdate) {
          this.afterUpdate();
        }
        
      }
    },

    
    loop : function(timePos)
    {
      if (timePos >= this._startOn)
      {

        if (timePos >= this._finishOn)
        {

          this.render(1.0);
          this.cancel();

          if (this.beforeFinishInternal) {
            this.beforeFinishInternal();
          }

          if (this.beforeFinish) {
            this.beforeFinish();
          }

          if (this.finish) {
            this.finish();
          }

          if (this.afterFinishInternal) {
            this.afterFinishInternal();
          }

          if (this.afterFinish) {
            this.afterFinish();
          }

          return;  
        }

        var pos   = (timePos - this._startOn) / this._totalTime,
            frame = Math.round(pos * this._totalFrames);

        if (frame > this._currentFrame)
        {
          this.render(pos);
          this._currentFrame = frame;
        }
      
      }
    },

    cancel : function()
    {
      if (!this._options.sync)
      {
        var queue = this._getQueue();
        console.warn("q: ",queue)
        qx.fx.Effect.Queues.get(queue).remove(this);
      }

      this._state = qx.fx.Effect.EffectState.finished;
    },

    _getQueue : function()
    {
      return (typeof(this._options.queue) == "string") ?
          'global' : this._options.queue.scope;
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