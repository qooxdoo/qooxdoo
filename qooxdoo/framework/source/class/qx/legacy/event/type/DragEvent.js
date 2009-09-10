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
     * Andreas Ecker (ecker)

************************************************************************ */

/** The event object for drag and drop sessions */
qx.Class.define("qx.legacy.event.type.DragEvent",
{
  extend : qx.legacy.event.type.MouseEvent,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vType, vMouseEvent, vTarget, vRelatedTarget)
  {
    this._mouseEvent = vMouseEvent;

    var vOriginalTarget = null;

    switch(vType)
    {
      case "dragstart":
      case "dragover":
        vOriginalTarget = vMouseEvent.getOriginalTarget();
    }

    this.base(arguments, vType, vMouseEvent.getDomEvent(), vTarget.getElement(), vTarget, vOriginalTarget, vRelatedTarget);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      UTILITIY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getMouseEvent : function() {
      return this._mouseEvent;
    },




    /*
    ---------------------------------------------------------------------------
      APPLICATION CONNECTION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {void}
     * @throws TODOC
     */
    startDrag : function()
    {
      if (this.getType() != "dragstart") {
        throw new Error("qx.legacy.event.type.DragEvent startDrag can only be called during the dragstart event: " + this.getType());
      }

      this.stopPropagation();
      qx.legacy.event.handler.DragAndDropHandler.getInstance().startDrag();
    },




    /*
    ---------------------------------------------------------------------------
      DATA SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param sType {String} TODOC
     * @param oData {Object} TODOC
     * @return {void}
     */
    addData : function(sType, oData) {
      qx.legacy.event.handler.DragAndDropHandler.getInstance().addData(sType, oData);
    },


    /**
     * TODOC
     *
     * @param sType {String} TODOC
     * @return {var} TODOC
     */
    getData : function(sType) {
      return qx.legacy.event.handler.DragAndDropHandler.getInstance().getData(sType);
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    clearData : function() {
      qx.legacy.event.handler.DragAndDropHandler.getInstance().clearData();
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getDropDataTypes : function() {
      return qx.legacy.event.handler.DragAndDropHandler.getInstance().getDropDataTypes();
    },




    /*
    ---------------------------------------------------------------------------
      ACTION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param sAction {String} TODOC
     * @return {void}
     */
    addAction : function(sAction) {
      qx.legacy.event.handler.DragAndDropHandler.getInstance().addAction(sAction);
    },


    /**
     * TODOC
     *
     * @param sAction {String} TODOC
     * @return {void}
     */
    removeAction : function(sAction) {
      qx.legacy.event.handler.DragAndDropHandler.getInstance().removeAction(sAction);
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getAction : function() {
      return qx.legacy.event.handler.DragAndDropHandler.getInstance().getCurrentAction();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    clearActions : function() {
      qx.legacy.event.handler.DragAndDropHandler.getInstance().clearActions();
    },




    /*
    ---------------------------------------------------------------------------
      USER FEEDBACK SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the widget to show as feedback for the user. This widget should
     * represent the object(s) the user is dragging.
     *
     * @param widget {qx.legacy.ui.core.Widget} the feedback widget.
     * @param deltaX {int ? 10} the number of pixels the top-left corner of the widget
     *          should be away from the mouse cursor in x direction.
     * @param deltaY {int ? 10} the number of pixels the top-left corner of the widget
     *          should be away from the mouse cursor in y direction.
     * @param autoDisposeWidget {Boolean} whether the widget should be disposed when
     *          dragging is finished or cancelled.
     * @return {void}
     */
    setFeedbackWidget : function(widget, deltaX, deltaY, autoDisposeWidget) {
      qx.legacy.event.handler.DragAndDropHandler.getInstance().setFeedbackWidget(widget, deltaX, deltaY, autoDisposeWidget);
    },




    /*
    ---------------------------------------------------------------------------
      CURSPOR POSITIONING SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the position of the cursor feedback (the icon showing whether dropping
     * is allowed at the current position and which action a drop will do).
     *
     * @param deltaX {int} The number of pixels the top-left corner of the
     *          cursor feedback should be away from the mouse cursor in x direction.
     * @param deltaY {int} The number of pixels the top-left corner of the
     *          cursor feedback should be away from the mouse cursor in y direction.
     * @return {void}
     */
    setCursorPosition : function(deltaX, deltaY) {
      qx.legacy.event.handler.DragAndDropHandler.getInstance().setCursorPosition(deltaX, deltaY);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_mouseEvent");
  }
});
