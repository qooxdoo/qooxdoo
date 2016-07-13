/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * @tag noPlayground
 *
 * @use(qx.event.dispatch.DomBubbling)
 * @use(qx.event.handler.Keyboard)
 * @use(qx.event.handler.Pointer)
 * @use(qx.event.handler.Element)
 */
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

      var cmd = new qx.ui.command.Command("Shift-Meta-F1");
      cmd.addListener("execute", function() {
        this.debug(cmd.toString());
      }, this);

      var cmd2 = new qx.ui.command.Command("Ctrl-A");
      cmd2.addListener("execute", function() {
        this.debug(cmd2.toString());
      }, this);

      this._juhu = document.getElementById("juhu");
      this._inner = document.getElementById("inner");

      qx.event.Registration.addListener(this._juhu, "contextmenu", this._preventDefault, this);
      qx.event.Registration.addListener(this._inner, "tap", this._stopPropagation, this);
      qx.event.Registration.addListener(this._juhu, "tap", this._onTap1, this);
      qx.event.Registration.addListener(this._juhu, "tap", this._onTap2, this);
      qx.event.Registration.addListener(this._juhu, "keydown", this._onTap2, this);

      qx.event.Registration.addListener(this._juhu, "pointerover", this._onpointerover, this);
      qx.event.Registration.addListener(this._juhu, "pointerout", this._onpointerout, this);

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
      this._log(["Resize:" + e]);
    },

    _onKeydown: function(e) {
      this._log(["keydown: " + e.getKeyIdentifier()]);
    },

    _onKeyinput: function(e) {
      this._log(["keyinput: " + e.getCharCode()]);
    },

    _onpointerover : function(e) {
      this._log(["pointer over"]);
    },

    _onpointerout : function(e) {
      this._log(["pointer out"]);
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


    _onTap1 : function(e)
    {
      this._log([e.getType() + " 1: " +  e]);
      qx.event.Registration.removeListener(this._juhu, "tap", this._onTap1);
    },

    _onTap2 : function(e)
    {
      this._log([e.getType() + " 2: " + e]);
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    this._juhu = this._inner = null;
  }
});
