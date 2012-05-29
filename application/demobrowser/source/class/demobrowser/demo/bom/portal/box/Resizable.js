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
 * Decorator to implement resizing of a box
 */
qx.Class.define("demobrowser.demo.bom.portal.box.Resizable",
{
  extend : qx.core.Object,


  /**
   * Constructor method
   *
   * @param box {demobrowser.demo.bom.portal.box.Box} box instance to decorate
   * @param options {Map} Map to pass optional settings
   */
  construct : function(box, options)
  {
    this.base(arguments);

    this.__box = box;
    this.__element = this.__box.getElement();

    this.__handles = {};

    this.__capturingPhase = false;

    this.__mouseMoveData = {
        orientation : null,
        lastCoord   : { left : null, top  : null }
    };

    this.__options =
    {
      minWidth  : 10,
      minHeight : 10,
      maxWidth  : null,
      maxHeight : null,
      autoHide  : true,
      handles   : 3
    };

    for (var name in this.__options)
    {
      if (options[name]) {
        this.__options[name] = options[name];
      }
    }

    this.__prepare();
  },


  /* ******************************************************
   *    MEMBERS
   * ******************************************************/
  members :
  {
    /** Hash to store the data of the mouse move events */
    __mouseMoveData : null,

    __box : null,
    __element : null,
    __handles : null,
    __options : null,
    __capturingPhase : false,


    /**
     * Return the box
     *
     * @return {demobrowser.demo.bom.portal.box.Box} box instance
     */
    getBox : function() {
      return this.__box;
    },


    /**
     * Decorate the box element with resizing handles
     *
     * @return {void}
     */
    __prepare : function()
    {
      switch(this.__options.handles)
      {
        case 1:
          this.__handles.east = null;
          break;

        case 2:
          this.__handles.south = null;
          break;

        case 3:
          this.__handles.south = null;
          this.__handles.southeast = null;
          this.__handles.east = null;
          break;
      }

      // add 3 div elements for resizing
      for (var orientation in this.__handles)
      {
        var handle = this.__handles[orientation] = qx.dom.Element.create("div");
        qx.bom.element.Attribute.set(handle, "orientation", orientation);

        qx.dom.Element.insertEnd(handle, this.__element);

        if (this.__element.id) {
          handle.id = this.__element.id + "_" + orientation;
        }

        this.__styleHandle(orientation);
        this.__addListener(orientation);
      }
    },


    /**
     * Helper to style the resizing handles
     *
     * @param orientation {String} Orientation of the handle
     * @return {void}
     */
    __styleHandle : function(orientation)
    {
      qx.bom.element.Class.add(this.__handles[orientation], orientation + "Handle");
      qx.bom.element.Style.set(this.__handles[orientation], "visibility", this.__options.autoHide ? "hidden" : "visible");
    },


    /* ******************************************************
     *    EVENT HANDLING
     * ******************************************************/

    /**
     * Add the event listener to the handle (specified by "orientation")
     *
     * @param orientation {String} orientation of the handle
     * @return {void}
     */
    __addListener : function(orientation)
    {
      var Registration = qx.event.Registration;
      var handle = this.__handles[orientation];

      Registration.addListener(handle, "mousedown", this.__mouseDownListener, this);
      Registration.addListener(document, "mouseup", this.__mouseUpListener, this);

      if (this.__options.autoHide)
      {
        Registration.addListener(this.__box.getElement(), "mouseover", this.__mouseOverListener, this);
        Registration.addListener(this.__box.getElement(), "mouseout", this.__mouseOutListener, this);
      }
    },


    /**
     * Listener method for "mouseDown" events
     *
     * @param e {qx.event.type.Mouse} mouse event object
     * @return {void}
     */
    __mouseOverListener : function(e)
    {
      for (var orientation in this.__handles) {
        qx.bom.element.Style.set(this.__handles[orientation], "visibility", "visible");
      }
    },


    /**
     * Listener method for "mouseOut" events
     *
     * @param e {qx.event.type.Mouse} mouse event object
     * @return {void}
     */
    __mouseOutListener : function(e)
    {
      if (!this.__capturingPhase)
      {
        for (var orientation in this.__handles) {
          qx.bom.element.Style.set(this.__handles[orientation], "visibility", "hidden");
        }
      }
    },


    /**
     * Listener method for "mouseDown" events
     *
     * @param e {qx.event.type.Mouse} mouse event object
     * @return {void}
     */
    __mouseDownListener : function(e)
    {
      e.stopPropagation();

      // only act when the left button is pressed
      if (e.isLeftPressed())
      {
        // dynamically add "mousemove" listener
        qx.event.Registration.addListener(document, "mousemove", this.__mouseMoveListener, this, true);
        this.__capturingPhase = true;

        var target = e.getTarget();
        this.__mouseMoveData.orientation = qx.bom.element.Attribute.get(target, "orientation");

        // store the current coordinates
        this.__mouseMoveData.lastCoord.left = e.getDocumentLeft();
        this.__mouseMoveData.lastCoord.top = e.getDocumentTop();

        demobrowser.demo.bom.portal.box.Util.bringToFront(this.__element);
      }
    },


    /**
     * Listener method for "mouseUp" events
     *
     * @param e {qx.event.type.Mouse} mouse event object
     * @return {void}
     */
    __mouseUpListener : function(e)
    {
      e.stopPropagation();

      if (this.__capturingPhase)
      {
        // remove the "mousemove" listener at the end of the resize operation
        qx.event.Registration.removeListener(document, "mousemove", this.__mouseMoveListener, this, true);

        demobrowser.demo.bom.portal.box.Util.sendToBack(this.__element);

        if (this.__options.autoHide)
        {
          for (var orientation in this.__handles) {
            qx.bom.element.Style.set(this.__handles[orientation], "visibility", "hidden");
          }
        }

        this.__capturingPhase = false;

        qx.bom.Selection.clear(document.body);
      }
    },


    /**
     * Listener method for "mouseMove" event
     *
     * @param e {qx.event.type.Mouse} mouse event object
     * @return {void}
     */
    __mouseMoveListener : function(e)
    {
      e.stopPropagation();

      if (this.__capturingPhase)
      {
        var mouseCoord = { left : null, top  : null };

        switch(this.__mouseMoveData.orientation)
        {
          case "south":
            mouseCoord.top = e.getDocumentTop();
            break;

          case "southeast":
            mouseCoord.top  = e.getDocumentTop();
            mouseCoord.left = e.getDocumentLeft();
            break;

          case "east":
            mouseCoord.left = e.getDocumentLeft();
            break;
        }

        // resize the box
        this.__resize(mouseCoord, this.__mouseMoveData.lastCoord);

        // after resizing update the coordinates
        this.__mouseMoveData.lastCoord.left = e.getDocumentLeft();
        this.__mouseMoveData.lastCoord.top = e.getDocumentTop();
      }
    },


    /* ******************************************************
     *    RESIZING
     * ******************************************************/

    /**
     * Resize the box with the given coordinates
     *
     * @param mouseCoord {Map} Map with the left and top coords of the mouse move event
     * @param lastMouseCoord {Map} Map with the left and top coords of the last position of the container
     * @return {void}
     */
    __resize : function(mouseCoord, lastMouseCoord)
    {
      var Dimension = qx.bom.element.Dimension;

      var groupBox = demobrowser.demo.bom.portal.box.Manager.getInstance().getGroupBoxDataOfBox(this.__box.getId());
      var groupBoxInnerDimensions = Dimension.getContentSize(groupBox.element);

      if (mouseCoord.left)
      {
        var mouseDiff = mouseCoord.left - lastMouseCoord.left;
        if (mouseDiff !== 0)
        {
          // Use the inner width of the element to set as new width and the
          // full size (including padding, margin) for comparison
          var newContentWidth = Dimension.getContentWidth(this.__element) + mouseDiff;
          var newWidth = Dimension.getWidth(this.__element) + mouseDiff;

          if ((this.__options.minWidth == null || newContentWidth > this.__options.minWidth) &&
              (this.__options.maxWidth == null || newContentWidth <= this.__options.maxWidth))
          {
            if (groupBoxInnerDimensions.width >= newWidth) {
              qx.bom.element.Style.set(this.__element, "width", newContentWidth + 'px');
              this.__box.getData().width=newContentWidth;
            }
          }
        }
      }

      if (mouseCoord.top)
      {
        var mouseDiff = mouseCoord.top - lastMouseCoord.top;
        if (mouseDiff !== 0)
        {
          var newContentHeight = Dimension.getContentHeight(this.__element) + mouseDiff;

          if ((this.__options.minHeight == null || newContentHeight > this.__options.minHeight) &&
              (this.__options.maxHeight == null || newContentHeight <= this.__options.maxHeight)) {
            qx.bom.element.Style.set(this.__element, "height", newContentHeight + "px");
          }
        }
      }
    }
  },


  /* ******************************************************
   *    DESTRUCT
   * ******************************************************/
  destruct : function()
  {
    if (this.__options.autoHide)
    {
      qx.event.Registration.removeListener(this.__box.getElement(), "mouseover", this.__mouseOverListener, this);
      qx.event.Registration.removeListener(this.__box.getElement(), "mouseout", this.__mouseOutListener, this);
    }

    this.__box = this.__options = this.__element = this.__handles = null;
    this.__mouseMoveData = null;
  }
});
