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

#use(qx.event.dispatch.Direct)
#use(qx.event.dispatch.DomBubbling)
#use(qx.event.handler.Keyboard)
#use(qx.event.handler.Mouse)
#use(qx.event.handler.Element)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.event.Event_Iframe",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var iframe = qx.bom.Iframe.create({
        name : "iframe",
        src : "data/Event_2_frame.html"
      });
      iframe.id = "iframe";
      document.body.appendChild(iframe);

      qx.event.Registration.addListener(iframe, "load", this.bindIFrameEvents, this);
    },

    bindIFrameEvents : function()
    {
      var iframe = window.document.getElementById("iframe");
      var iframeDocument = qx.bom.Iframe.getDocument(iframe);

      this._juhu = iframeDocument.getElementById("juhu");
      this._inner = iframeDocument.getElementById("inner");

      qx.event.Registration.addListener(this._juhu, "contextmenu", this._preventDefault, this);
      qx.event.Registration.addListener(this._inner, "click", this._stopPropagation, this);
      qx.event.Registration.addListener(this._juhu, "click", this._onclick1, this);
      qx.event.Registration.addListener(this._juhu, "click", this._onclick2, this);

      qx.event.Registration.addListener(
          iframeDocument.getElementById("input"),
        "keydown",
        this._onkeydown, this
      );

      for (var i=1; i<10; i++) {
        var div = iframeDocument.getElementById("div"+i);
        qx.event.Registration.addListener(div, "click", this._cascadeCapture, this, true);
        qx.event.Registration.addListener(div, "click", this._cascadeBubble, this, false);
      }

      qx.event.Registration.addListener(
        iframeDocument.getElementById("scroll"),
        "scroll",
        this._scroll,
        this
      );

    },

     _onkeydown: function(e) {
      this.debug("keydown: " + e.getKeyIdentifier());
    },

    _scroll: function(e) {
      this.debug("scroll");
    },

    _cascadeCapture : function(e) {
      var elem = e.getCurrentTarget();
      this.debug("capture: " + elem.id + " " + e.getEventPhase());
    },

    _cascadeBubble : function(e) {
      var elem = e.getCurrentTarget();
      this.debug("bubble: " + elem.id + " " + e.getEventPhase());
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
