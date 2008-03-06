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

qx.Class.define("demobrowser.demo.bom.DragDrop_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this._el = document.getElementById("drag");

      qx.bom.Element.addListener(this._el, "dragstart", this._onDragstart, this);
      qx.bom.Element.addListener(this._el, "dragmove", this._onDragmove, this);
      qx.bom.Element.addListener(this._el, "dragstop", this._onDragstop, this);

      this.setLocation(20, 20);
    },

    setLocation : function(left, top)
    {
      this._left = Math.max(0, left);
      this._top = Math.max(0, top);

      qx.bom.element.Style.set(this._el, "top", this._top);
      qx.bom.element.Style.set(this._el, "left", this._left);
      this._el.innerHTML = "drag me (" + this._left + ", " + this._top + ")";
    },

    _onDragstart : function(e)
    {
      this._startLeft = this._left;
      this._startTop = this._top;
      qx.bom.element.Style.set(this._el, "opacity", 0.7);
    },

    _onDragstop : function(e) {
      qx.bom.element.Style.set(this._el, "opacity", 1);
    },

    _onDragmove : function(e)
    {
      this.setLocation(
        this._startLeft + e.getDragOffsetLeft(),
        this._startTop + e.getDragOffsetTop()
      )
    }
  }
});