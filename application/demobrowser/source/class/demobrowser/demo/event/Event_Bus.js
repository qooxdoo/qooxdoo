/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Back (aback)

************************************************************************ */

qx.Class.define("demobrowser.demo.event.Event_Bus",
{
  extend : demobrowser.demo.event.EventDemo,


  members :
  {
    main : function()
    {
      this.base(arguments);

      this._initLogger(
        ["Subscribe", "Dispatch", "Receiving", "Message", "Callback"],
        document.getElementById("logger"),
        50
      );
      
      var eventBus = qx.event.message.Bus;
      
      // subscribe to message "start"
      eventBus.subscribe("start", this._startCallback, this);
      this._log(["X", "", "", "start", "_startCallback"]);
      
      // subscribe to message "start"
      eventBus.subscribe("start", this._anotherStartCallback, this);
      this._log(["X", "", "", "start", "_anotherStartCallback"]);
      
      // subscribe to message "loading"
      eventBus.subscribe("loading", this._loadingCallback, this);
      this._log(["X", "", "", "loading", "_loadingCallback"]);
      
      // subscribe to message "finished"
      eventBus.subscribe("finished", this._finishedCallback, this);
      this._log(["X", "", "", "finished", "_finishedCallback"]);
      
      // subscribe to message "finished"
      eventBus.subscribe("finished", this._anotherFinishedCallback, this);
      this._log(["X", "", "", "finished", "_anotherFinishedCallback"]);
      
      
      // send messages in timeouts
      
      // 'start' message
      qx.event.Timer.once(function(e){
        this._log(["", "X", "", "start", ""]);
        eventBus.getInstance().dispatch("start");
      }, this, 1000);
      
      
      // 'loading' message
      qx.event.Timer.once(function(e){
        this._log(["", "X", "", "loading", ""]);
        eventBus.getInstance().dispatch("loading");
      }, this, 2500);
      
      
      // 'loading' message
      qx.event.Timer.once(function(e){
        this._log(["", "X", "", "loading", ""]);
        eventBus.getInstance().dispatch("loading");
      }, this, 4000);
      
      
      // 'finished' message
      qx.event.Timer.once(function(e){
        this._log(["", "X", "", "finished", ""]);
        eventBus.getInstance().dispatch("finished");
      }, this, 5000);
    },
    
    
    _startCallback : function(e)
    {
      this._log(["", "", "X", "start", "_startCallback"]);
    },
    
    _anotherStartCallback : function(e)
    {
      this._log(["", "", "X", "start", "_anotherStartCallback"]);
    },
    
    _loadingCallback : function(e)
    {
      this._log(["", "", "X", "loading", "_loadingCallback"]);
    },
    
    _finishedCallback : function(e)
    {
      this._log(["", "", "X", "finished", "_finishedCallback"]);
    },
    
    _anotherFinishedCallback : function(e)
    {
      this._log(["", "", "X", "finished", "_anotherFinishedCallback"]);
    }
  }
});
