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

qx.Class.define("demobrowser.demo.event.DragDrop_1",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this._el = document.getElementById("drag");

      qx.bom.Element.addListener(this._el, "dragstart", this._onDragstart, this);
      qx.bom.Element.addListener(this._el, "drag", this._onDragmove, this);
      qx.bom.Element.addListener(this._el, "dragend", this._onDragstop, this);

      this.setLocation(20, 20);

      var dropElements = ["drop1", "drop2"];

      for (var i=0; i<dropElements.length; i++)
      {
        var el = document.getElementById(dropElements[i]);

        qx.bom.Element.addListener(el, "dragenter", this._onDragenter, this);
        qx.bom.Element.addListener(el, "dragleave", this._onDragleave, this);
        qx.bom.Element.addListener(el, "drop", this._onDrop, this);
      }
    },

    setLocation : function(left, top)
    {
      this._left = Math.max(0, left);
      this._top = Math.max(0, top);

      qx.bom.element.Style.set(this._el, "top", this._top + "px");
      qx.bom.element.Style.set(this._el, "left", this._left + "px");
      this._el.innerHTML = "drag me (" + this._left + ", " + this._top + ")";
    },

    _onDragstart : function(e)
    {
      this._startLeft = this._left;
      this._startTop = this._top;
      qx.bom.element.Style.set(this._el, "opacity", 0.7);
    },

    _onDragstop : function(e)
    {
      qx.bom.element.Style.set(this._el, "opacity", 1);

      var animMove = new qx.fx.effect.core.Move(this._el).set({
        x : 20,
        y : 20,
        mode : "absolute",
        transition : "easeOutQuad"
      });
      this._left = 20;
      this._top = 20;

      animMove.start();
    },

    _onDragmove : function(e)
    {
      this.setLocation(
        this._startLeft + e.getDragOffsetLeft(),
        this._startTop + e.getDragOffsetTop()
      )
    },

    _onDragenter : function(e)
    {
      this.debug("enter");
      this.debug(e.getCurrentTarget());
      qx.bom.element.Style.set(e.getCurrentTarget(), "border", "1px dotted black");
      e.stop();
    },

    _onDragleave : function(e) {
      this.debug("leave");
      this.debug(e.getCurrentTarget());
      qx.bom.element.Style.reset(e.getCurrentTarget(), "border");
      e.stop();
    },

    _onDrop : function(e)
    {
      var el = e.getCurrentTarget();

      this.debug("drop");
      this.debug(el);
      qx.bom.element.Style.reset(el, "border");

      var effect = new qx.fx.effect.core.Highlight(el).set({
          startColor        : qx.bom.element.Style.get(el, "backgroundColor"),
          endColor          : "#A0FF24",
          restoreBackground : true
      });
      effect.start();
      e.stop();
    }

  }
});