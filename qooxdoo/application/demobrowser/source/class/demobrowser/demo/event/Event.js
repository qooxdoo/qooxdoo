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

#use(qx.event.dispatch.DomBubbling)
#use(qx.event.handler.Keyboard)
#use(qx.event.handler.Mouse)
#use(qx.event.handler.Element)
#use(qx.event.handler.DomReady)

************************************************************************ */

qx.Class.define("demobrowser.demo.event.Event",
{
  extend : demobrowser.demo.event.EventDemo,


  members :
  {
    main : function()
    {
      this.base(arguments);

      this._initLogger(
        ["Events"],
        document.getElementById("logger"),
        50
      );

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

      qx.event.Registration.addListener(this._juhu, "mouseover", this._onmouseover, this);
      qx.event.Registration.addListener(this._juhu, "mouseout", this._onmouseout, this);

      qx.event.Registration.addListener(
        document.getElementById("input"),
        "keydown",
        this._onKeydown, this
      );

      qx.event.Registration.addListener(
        document.getElementById("input"),
        "keyinput",
        this._onKeyinput, this
      );

      qx.event.Registration.addListener(
        document.getElementById("scroll"),
        "scroll",
        this._scroll,
        this
      );
    },

    _onResize : function(e) {
      this.log(["Resize:" + e]);
    },

    _onKeydown: function(e) {
      this._log(["keydown: " + e.getKeyIdentifier()]);
    },

    _onKeyinput: function(e) {
      this._log(["keyinput: " + e.getCharCode()]);
    },

    _onmouseover : function(e) {
      this._log(["mouse over"]);
    },

    _onmouseout : function(e) {
      this._log(["mouse out"]);
    },

    _scroll: function(e) {
      this._log(["scroll:" + e.getTarget()]);
    },

    _preventDefault : function(e)
    {
      this._log(["prevent default " + e.getType() + ": " + e]);
      e.preventDefault();
    },

    _stopPropagation : function(e)
    {
      this._log([e.getType() + " (inner): " + e]);
      e.stopPropagation();
    },


    _onclick1 : function(e)
    {
      this._log([e.getType() + " 1: " +  e]);
      qx.event.Registration.removeListener(this._juhu, "click", this._onclick1);
    },

    _onclick2 : function(e)
    {
      this._log([e.getType() + " 2: " + e]);
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
