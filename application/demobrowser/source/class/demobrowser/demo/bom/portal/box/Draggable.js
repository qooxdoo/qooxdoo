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
     * Alexander Steitz (aback)
     * David Werner (psycledw)

************************************************************************ */


/**
 * Implementation of a draggable box
 */
qx.Class.define("demobrowser.demo.bom.portal.box.Draggable",
{
  extend : qx.core.Object,

  /**
   * @param box {demobrowser.demo.bom.portal.box.Box} box instance to decorate
   */
  construct : function(box)
  {
    this.base(arguments);

    this.__box = box;
    this.__element = box.getElement();
    this.__handle = null;
    this.__offsets = null;

    this.__prepare();
  },


  /* ******************************************************
   *    MEMBERS
   * ******************************************************/
  members :
  {
    __box : null,
    __element : null,
    __handle : null,
    __offsets : null,

    /**
     * Return the box
     *
     * @return {demobrowser.demo.bom.portal.box.Box} box instance
     */
    getBox : function() {
      return this.__box;
    },

    /**
     * Return the element of the box
     *
     * @return {Element} Element node of the box
     */
    getElement : function() {
      return this.__element;
    },


    /**
     * Internal preparation (adding handle)
     */
    __prepare : function()
    {
      this.__createHandle();
      this.__addListener();
    },


    /**
     * Creates the handle to drag the box around.
     */
    __createHandle : function()
    {
      this.__handle = qx.dom.Element.create("div");

      /* Only set the className attribute (CSS is defined seperately) */
      qx.bom.element.Class.add(this.__handle, "dragHandle");

      qx.dom.Element.insertBegin(this.__handle, this.__element);
    },


    /**
     * Internal method to add all needed event listener methods
     */
    __addListener : function()
    {
      qx.bom.Element.addListener(this.__handle, "mousedown", this.__onMouseDown, this);
      qx.bom.Element.addListener(this.__handle, "mouseover", function(e) {
        qx.bom.element.Style.set(this, "cursor", "move");
      }, this.__handle);

      qx.bom.Element.addListener(this.__handle, "dragstart", this.__onDragStart, this);
      qx.bom.Element.addListener(
        this.__handle,
        "dragend",
        demobrowser.demo.bom.portal.dragdrop.Manager.getInstance().stopSession,
        demobrowser.demo.bom.portal.dragdrop.Manager.getInstance()
      );
      qx.bom.Element.addListener(this.__handle, "drag", this.__onDragMove, this);
    },


    /**
     * Listener method for "mousedown" events.
     * Sets the start offset for the drag and drop session
     *
     * @param e {qx.event.type.Mouse} mouse event instance
     */
    __onMouseDown : function(e)
    {
      if (e.isLeftPressed())
      {
        this.__offsets =
        {
          left : e.getDocumentLeft() - qx.bom.element.Location.getLeft(this.__element),
          top  : e.getDocumentTop() - qx.bom.element.Location.getTop(this.__element)
        };

        // add "mouseup" event listener
        qx.bom.Element.addListener(document.body, "mouseup", this.__onMouseUp, this, true);

        this.__monitorMouseLeaveViewport();

        // fire dragstart event
        qx.event.Registration.fireEvent(this.__handle, "dragstart", qx.event.type.Event);
      }
    },


    /**
     * Call the mouseup listener method if the cursor leaves the viewport since
     * IE won't fire a mouseup event while the cursor is outside the viewport.
     *
     * @signature function()
     */
    __monitorMouseLeaveViewport : qx.core.Environment.select("engine.name",
    {
      "mshtml" : function()
      {
        var that = this;
        var bound = qx.lang.Function.bind(this.__onMouseUp, that);
        document.getElementsByTagName("html")[0].onmouseleave = bound;
      },
      "default" : qx.lang.Function.empty
    }),


    /**
     * Listener method for "mouseup" events.
     * Removes the "mousemove" event listener
     *
     * @param e {qx.event.type.Mouse} mouse event instance
     */
    __onMouseUp : function(e)
    {
      try {
        e.stopPropagation();
      }
      catch (ex) {}

      if (demobrowser.demo.bom.portal.dragdrop.Manager.getInstance().isSessionActive())
      {
        qx.event.Registration.removeListener(document.body, "mousemove", this.__onDragMove, this, true);
        demobrowser.demo.bom.portal.dragdrop.Manager.getInstance().stopSession();
      }
      qx.bom.Element.removeListener(document.body, "mouseup", this.__onMouseUp, this, true);
    },


    /**
     * Listener method for "dragStart" event
     *
     * @param e {qx.event.type.Drag} drag event instance
     */
    __onDragStart : function(e)
    {
      // it may happen that this "dragStart" event is fired even if the drag
      // session is still active - for example the user released the mouse button
      // outside of the viewport
      if (demobrowser.demo.bom.portal.dragdrop.Manager.getInstance().isSessionActive()) {
        return;
      }

      // set the current box as the active one
      demobrowser.demo.bom.portal.box.Manager.getInstance().setActiveBox(this.__box);

      // let the dragDrop manager take control
      demobrowser.demo.bom.portal.dragdrop.Manager.getInstance().startSession(this.__box);

      // add "mousemove" listener
      qx.event.Registration.addListener(document.body, "mousemove", this.__onDragMove, this, true);
    },


    /**
     * Listener method for all "drag" events
     *
     * @param e {qx.event.type.Drag} drag event instance
     */
    __onDragMove : function(e)
    {
      e.stopPropagation();

      // get the needed infos from the event and call the manager
      var left = e.getDocumentLeft() - this.__offsets.left;
      var top  = e.getDocumentTop() - this.__offsets.top;

      // with this timeout everything is a little bit smoother
      qx.event.Timer.once(function()
      {
        this.checkGroupBox(left,parseInt(this.getActiveBox().getData().width));
        this.onDragMove(top, left);
      }, demobrowser.demo.bom.portal.dragdrop.Manager.getInstance(), 0);
    }
  },


  /* ******************************************************
   *    DESTRUCT
   * ******************************************************/
  destruct : function() {
    this.__box = this.__handle = this.__element = this.__offsets = null;
  }
});
