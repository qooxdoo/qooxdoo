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

    if (qx.util.Validation.isInvalidObject(options)) {
      options = qx.lang.Object.copy(qx.fx.Base.DefaultOptions);
    }

    if (typeof(options.transition) != "function") {
      this._transition = qx.fx.Transition.linear;
    } else {
      this._transition = options.transition;
    }

    this._options = qx.lang.Object.copy(qx.fx.Base.DefaultOptions);
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
      this._state        = qx.fx.Base.EffectState.idle;
      this._startOn      = this._options.delay * 1000;
      this._finishOn     = this._startOn + (this._options.duration * 1000);
      this._fromToDelta  = this._options.to - this._options.from;
      this._totalTime    = this._finishOn - this._startOn;
      this._totalFrames  = this._options.fps * this._options.duration;
    },

    beforeFinishInternal : function(){},
    beforeFinish : function(){},
    finish  : function(){},
    afterFinishInternal : function(){},
    afterFinish : function(){},

    beforeSetupInternal : function(){},
    beforeSetup : function(){},
    setup : function(){},
    afterSetupInternal : function(){},
    afertSetup : function(){},

    beforeUpdateInternal : function(){},
    beforeUpdate : function(){},
    update : function(){},
    afterUpdateInternal : function(){},
    afterUpdate : function(){},
    
    beforeStartInternal : function(){},
    beforeStart : function(){},

    start : function()
    {
      
      switch (this._state)
      {
        case qx.fx.Base.EffectState.finished :
          this.init();
        break;

        case qx.fx.Base.EffectState.running :
          this.end();
        break;
      }

      this.beforeStartInternal();
      this.beforeStart();

      if (!this._options.sync)
      {
        var queue = this._getQueue();
        qx.fx.queue.Manager.getInstance().getQueue(queue).add(this);
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
      if(this._state == qx.fx.Base.EffectState.idle)
      {
        this._state = qx.fx.Base.EffectState.running

        this.beforeSetupInternal();
        this.beforeSetup();

        this.setup();

        this.afterSetupInternal();
        this.afertSetup();

      }

      if(this._state == qx.fx.Base.EffectState.running)
      {

        this._position = this._transition(pos) * this._fromToDelta + this._options.from;

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
          return;  
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
      if (!this._options.sync)
      {
        var queue = this._getQueue();
        qx.fx.queue.Manager.getInstance().getQueue(queue).remove(this);
      }

      this._state = qx.fx.Base.EffectState.finished;
    },


    _getQueue : function() {
      return (typeof(this._options.queue) == "string") ? 'global' : this._options.queue.scope;
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