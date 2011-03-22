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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Native mouse events
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.event.MouseEvent_LowLevel",
{
  extend : demobrowser.demo.event.EventDemo,

  members :
  {
    __logMouseEventWrapper : null,

    main : function()
    {
      this.base(arguments);

      this.__logMouseEventWrapper = qx.lang.Function.bind(this.logMouseEvent, this);

      this._initLogger(
        ["Target", "Event", "button", "clientX", "clientY", "screenX", "screenY", "relatedTarget"],
        document.getElementById("logger"),
        50
      );

      var mouseDiv = document.getElementById("mouse");

      var events = ["mousedown", "mouseup", "click", "dblclick", "contextmenu", "mousemove", "mouseover", "mouseout"];
      for (var i=0; i<events.length; i++)
      {
        var elem = document.getElementById("check_" + events[i])
        if (elem.checked) {
          qx.bom.Event.addNativeListener(
            mouseDiv,
            events[i],
            this.__logMouseEventWrapper
          );
        }
        qx.bom.Event.addNativeListener(elem, "change", qx.lang.Function.bind(this.__changeCheckbox, this));
      }
    },

    __changeCheckbox : function(e)
    {
      var target = qx.bom.Event.getTarget(e);
      var type = target.id.split("_")[1];
      var checked = target.checked;
      var mouseDiv = document.getElementById("mouse");

      if (checked) {
        qx.bom.Event.addNativeListener(
          mouseDiv,
          type,
          this.__logMouseEventWrapper
        );
      }
      else
      {
        qx.bom.Event.removeNativeListener(
          mouseDiv,
          type,
          this.__logMouseEventWrapper
        );
      }
    },


    logMouseEvent: function(mouseEvent)
    {
      qx.bom.Event.preventDefault(mouseEvent);

      this._log([
        qx.bom.Event.getTarget(mouseEvent).id,
        mouseEvent.type,
        mouseEvent.button,
        mouseEvent.clientX,
        mouseEvent.clientY,
        mouseEvent.screenX,
        mouseEvent.screenY,
        qx.bom.Event.getRelatedTarget(mouseEvent) ? qx.bom.Event.getRelatedTarget(mouseEvent).id : ""
      ]);
    }
  }
});
