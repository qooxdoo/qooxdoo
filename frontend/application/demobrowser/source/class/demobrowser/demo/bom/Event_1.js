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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.event.dispatch.*)
#require(qx.event.handler.*)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Event_1",
{
  extend : demobrowser.Demo,


  members :
  {
    main : function()
    {
      this.base(arguments);

      qx.event.Registration.addListener(window, "resize", this._onResize, this);

      var cmd = new qx.event.Command("Shift-Meta-F1");
      cmd.addListener("execute", function() {
        this.debug(cmd.toString());
      }, this);

      var cmd2 = new qx.event.Command("Ctrl-A");
      cmd2.addListener("execute", function() {
        this.debug(cmd2.toString());
      }, this);

      this._juhu = document.getElementById("juhu");
      this._inner = document.getElementById("inner");

      qx.event.Registration.addListener(this._juhu, "contextmenu", this._preventDefault, this);
      qx.event.Registration.addListener(this._inner, "click", this._stopPropagation, this);
      qx.event.Registration.addListener(this._juhu, "click", this._onclick1, this);
      qx.event.Registration.addListener(this._juhu, "click", this._onclick2, this);
      qx.event.Registration.addListener(this._juhu, "keydown", this._onclick2, this);

      qx.event.Registration.addListener(
        document.getElementById("input"),
        "keydown",
        this._onkeydown, this
      );

      qx.event.Registration.addListener(
        document.getElementById("input"),
        "keyinput",
        this._onkeyinput, this
      );

      for (var i=1; i<10; i++) {
        var div = document.getElementById("div"+i);
        qx.event.Registration.addListener(div, "click", this._cascadeCapture, this, true);
        qx.event.Registration.addListener(div, "click", this._cascadeBubble, this, false);
      }

      qx.event.Registration.addListener(
        document.getElementById("scroll"),
        "scroll",
        this._scroll,
        this
      );

      qx.event.Registration.addListener(document.getElementById("div9"), "mousewheel", function(e)
      {
        this.debug("wheel: " + e.getTarget().id + " " + e.getWheelDelta());
      }, this);

    },

    _onResize : function(e) {
      this.debug("Resize:" + e);
    },

    _onJuhu : function(e) {
      this.debug("Juhu:" + e);
    },

    _onkeydown: function(e) {
      this.debug("keydown: " + e.getKeyIdentifier());
    },

    _onkeyinput: function(e) {
      this.debug("keyinput: " + e.getCharCode());
    },

    _scroll: function(e) {
      this.debug("scroll:" + e.getTarget());
    },

    _cascadeCapture : function(e)
    {
      var elem = e.getCurrentTarget();
      var title = e.getEventPhase() == 2 ? "at-target: " : "capture: ";

      this.debug(title + elem.id + " (capture-listener)");
    },

    _cascadeBubble : function(e)
    {
      var elem = e.getCurrentTarget();
      var title = e.getEventPhase() == 2 ? "at-target: " : "bubble: ";

      this.debug(title + elem.id + " (bubble-listener)");
    },

    _preventDefault : function(e)
    {
      this.debug(e.getType() + ": " + e);
      e.preventDefault();
    },

    _stopPropagation : function(e)
    {
      this.debug(e.getType() + " (inner): " + e);
      e.stopPropagation();
    },


    _onclick1 : function(e)
    {
      this.debug(e.getType() + " 1: " +  e);
      qx.event.Registration.removeListener(this._juhu, "click", this._onclick1);
    },

    _onclick2 : function(e)
    {
      this.debug(e.getType() + " 2: " + e);
    },

    _positionDiv : function(e) {
      var div = document.getElementById("moveable");
      div.style.left = (e.getDocumentLeft() - 16) + "px";
      div.style.top = (e.getDocumentTop() -16) + "px";
    }
  },


  defer : function()
  {
	  var domReady = function() {
			qx.log.Logger.debug("DOM Ready... juhi :)")
		}

    qx.event.Registration.addListener(window, "domready", domReady, this);
  }
});
