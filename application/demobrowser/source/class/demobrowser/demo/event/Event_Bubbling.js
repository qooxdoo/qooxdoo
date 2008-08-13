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

qx.Class.define("demobrowser.demo.event.Event_Bubbling",
{
  extend : demobrowser.demo.event.EventDemo,


  members :
  {
    main : function()
    {
      this.base(arguments);

      this._initLogger(
        ["Event", "Target", "Current target", "Event phase"],
        document.getElementById("logger"),
        50
      );

      for (var i=1; i<10; i++) {
        var div = document.getElementById("div"+i);
        qx.event.Registration.addListener(div, "click", this._cascadeCapture, this, true);
        qx.event.Registration.addListener(div, "click", this._cascadeBubble, this, false);
      }
    },

    _cascadeCapture : function(e)
    {
      this._log([
        e.getType(),
        e.getTarget().id,
        e.getCurrentTarget().id,
        e.getEventPhase() == 2 ? "at target" : "capture"
      ]);
    },

    _cascadeBubble : function(e)
    {
      this._log([
       e.getType(),
       e.getTarget().id,
       e.getCurrentTarget().id,
       e.getEventPhase() == 2 ? "at target" : "bubble"
     ]);
    }
  }
});
