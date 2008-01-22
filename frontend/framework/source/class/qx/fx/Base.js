/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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


    if(options && typeof(options.transition) != "function")
    {
      options.transition = qx.fx.Effect.Transitions.linear;
    }

    //this._options    = Object.extend(Object.extend({ },qx.fx.Effect.DefaultOptions), options || { });
    //this._options      = typeof(options) == "object" ? options : qx.fx.Effect.DefaultOptions;

    this._options      = qx.fx.Effect.DefaultOptions;
    for(var i in options)
    {
      console.info(i, options[i])
      this._options[i] = options[i];
    }
    
    this._currentFrame = 0;
    this._state        = qx.fx.Effect.EffectState.idle;
    this._startOn      = this._options.delay * 1000;
    this._finishOn     = this._startOn + (this._options.duration * 1000);
    this._fromToDelta  = this._options.to - this._options.from;
    this._totalTime    = this._finishOn - this._startOn;
    this._totalFrames  = this._options.fps * this._options.duration;
    this._element      = element;

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
    _options      : {},
    _currentFrame : 0,
    _state        : '',
    _startOn      : 0,
    _finishOn     : 0,
    _fromToDelta  : 0,
    _totalTime    : 0,
    _totalFrames  : 0,
    _position     : 0,
    _element      : null,

    start: function()
    {

      function codeForEvent(options,eventName)
      { // TODO: wtf?
        return (
          (options[eventName+'Internal'] ? 'this._options.'+eventName+'Internal(this);' : '') +
          (options[eventName] ? 'this._options.'+eventName+'(this);' : '')
        );
      }
  
      eval('this.render = function(pos){ '+
        'if (this._state==qx.fx.Effect.EffectState.idle){this._state=qx.fx.Effect.EffectState.running;'+
        codeForEvent(this._options,'beforeSetup')+
        (this.setup ? 'this.setup();':'')+ 
        codeForEvent(this._options,'afterSetup')+
        '};if (this._state==qx.fx.Effect.EffectState.running){'+
        'pos=this._options.transition(pos)*'+this._fromToDelta+'+'+this._options.from+';'+
        'this._position=pos;'+
        codeForEvent(this._options,'beforeUpdate')+
        (this.update ? 'this.update(pos);':'')+
        codeForEvent(this._options,'afterUpdate')+
        '}}');
  
  
  
      ///////////////////////////////////////////
  /*
      this.render = function(pos)
      {
        if(this.state == "idle")
        {
          this.state="running";
          codeForEvent(this.options, "beforeSetup");
          if(this.setup){
            this.setup();
          }
          codeForEvent(this.options, "afterSetup");
        }
  
        if(this.state == "running")
        {
          pos=this.options.transition(pos)*+this.fromToDelta+this.options.from;
          this.position=pos;
          codeForEvent(this.options,"beforeUpdate");
          if(this.update){
            this.update(pos);
          }
          codeForEvent(this.options,"afterUpdate");
        }
      }
  */
      ///////////////////////////////////////////
  
/*
     ///////////////////////////////////////////
      this.render = function(pos)
      {
        if(this.state == "idle")
        {
          this.state="running";
  
          codeForEvent(this.options, "beforeSetup");
          //this.options.beforeSetupInternal(this);
          //this.options.beforeSetup(this);
  
          if(this.setup){
            this.setup();
          }
  
          codeForEvent(this.options, "afterSetup");
          //this.options.afterSetupInternal(this);
          //this.options.afterSetup(this);
  
        }
  
        if(this.state == "running")
        {
          pos=this.options.transition(pos)*+this.fromToDelta+this.options.from;
          this.position=pos;
  
          codeForEvent(this.options,"beforeUpdate");
          //this.options.beforeUpdateInternal(this);
          //this.options.beforeUpdate(this);
  
          if(this.update){
            this.update(pos);
          }
  
          codeForEvent(this.options,"afterUpdate");
          //this.options.afterUpdateInternal(this);
          //this.options.afterUpdate(this);
  
        }
      }
      ///////////////////////////////////////////
*/
  
      this.event('beforeStart');
      
/*      
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ? 
        'global' : this.options.queue.scope).add(this);
*/      
      if (!this._options.sync)
      {
        var queue = this._getQueue();
        qx.fx.Effect.Queues.get(queue).add(this);
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
          this.event('beforeFinish');
          if (this.finish) this.finish(); 
          this.event('afterFinish');
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
/*
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ? 
        'global' : this.options.queue.scope).remove(this);
*/
      if (!this._options.sync)
      {
        var queue = this._getQueue();
        qx.fx.Effect.Queues.get(queue).remove(this);
      }

      this._state = qx.fx.Effect.EffectState.finished;
    },

    _getQueue : function()
    {
      return (typeof(this._options.queue) == "string") ?
          'global' : this._options.queue.scope;
    },
    
    event : function(eventName)
    {
      if (this._options[eventName + 'Internal']) this._options[eventName + 'Internal'](this);
      if (this._options[eventName]) this._options[eventName](this);
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