/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_dragdrop)
#embed(qx.widgettheme/cursors/*)

************************************************************************ */

/**
 * This manager (singleton) manage all drag and drop handling of a qx.core.Init instance.
 */
qx.Clazz.define("qx.event.handler.DragAndDropHandler",
{
  type : "singleton",
  extend : qx.manager.object.ObjectManager,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    qx.core.Target.call(this);

    this._data = {};
    this._actions = {};
    this._cursors = {};

    var vCursor;

    for (var vAction in this._actionNames)
    {
      vCursor = this._cursors[vAction] = new qx.ui.basic.Image(this._cursorPath + vAction + "." + this._cursorFormat);
      vCursor.setZIndex(1e8);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    sourceWidget :
    {
      _legacy : true,
      type    : "object"
    },

    destinationWidget :
    {
      _legacy : true,
      type    : "object"
    },

    cursor :
    {
      _legacy : true,
      type    : "object"
    },

    currentAction :
    {
      _legacy : true,
      type    : "string"
    },


    /**
     * The default delta x of the cursor feedback.
     *
     * @see #setCursorPosition
     */
    defaultCursorDeltaX :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 5,
      allowNull    : false
    },


    /**
     * The default delta y of the cursor feedback.
     *
     * @see #setCursorPosition
     */
    defaultCursorDeltaY :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 15,
      allowNull    : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _actionNames :
    {
      move   : "move",
      copy   : "copy",
      alias  : "alias",
      nodrop : "nodrop"
    },

    _cursorPath : "widget/cursors/",
    _cursorFormat : "gif",
    _lastDestinationEvent : null,




    /*
    ---------------------------------------------------------------------------
      COMMON MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyDestinationWidget : function(propValue, propOldValue, propData)
    {
      if (propValue)
      {
        propValue.dispatchEvent(new qx.event.type.DragEvent("dragdrop", this._lastDestinationEvent, propValue, this.getSourceWidget()));
        this._lastDestinationEvent = null;
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      DATA HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Add data of mimetype.
     *
     * #param vMimeType[String]: A valid mimetype
     * #param vData[Any]: Any value for the mimetype
     *
     * @type member
     * @param vMimeType {var} TODOC
     * @param vData {var} TODOC
     * @return {void}
     */
    addData : function(vMimeType, vData) {
      this._data[vMimeType] = vData;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vMimeType {var} TODOC
     * @return {var} TODOC
     */
    getData : function(vMimeType) {
      return this._data[vMimeType];
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    clearData : function() {
      this._data = {};
    },




    /*
    ---------------------------------------------------------------------------
      MIME TYPE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getDropDataTypes : function()
    {
      var vDestination = this.getDestinationWidget();
      var vDropTypes = [];

      // If there is not any destination, simple return
      if (!vDestination) {
        return vDropTypes;
      }

      // Search for matching mimetypes
      var vDropDataTypes = vDestination.getDropDataTypes();

      for (var i=0, l=vDropDataTypes.length; i<l; i++)
      {
        if (vDropDataTypes[i] in this._data) {
          vDropTypes.push(vDropDataTypes[i]);
        }
      }

      return vDropTypes;
    },

    getDropTarget : qx.core.Variant.select("qx.client",
    {
      gecko : function(e)
      {
        var vCurrent = e.getTarget();

        // work around gecko bug (all other browsers are correct)
        // clicking on a free space and drag prohibit the get of
        // a valid event target. The target is always the element
        // which was the one with the mousedown event before.
        if (vCurrent == this._dragCache.sourceWidget) {
          vCurrent = qx.event.handler.EventHandler.getTargetObject(qx.html.ElementFromPoint.getElementFromPoint(e.getPageX(), e.getPageY()));
        } else {
          vCurrent = qx.event.handler.EventHandler.getTargetObject(null, vCurrent);
        }

        while (vCurrent != null && vCurrent != this._dragCache.sourceWidget)
        {
          if (!vCurrent.supportsDrop(this._dragCache)) {
            return null;
          }

          if (this.supportsDrop(vCurrent)) {
            return vCurrent;
          }

          vCurrent = vCurrent.getParent();
        }

        return null;
      },

      none : function(e)
      {
        var vCurrent = e.getTarget();

        while (vCurrent != null)
        {
          if (!vCurrent.supportsDrop(this._dragCache)) {
            return null;
          }

          if (this.supportsDrop(vCurrent)) {
            return vCurrent;
          }

          vCurrent = vCurrent.getParent();
        }

        return null;
      }
    }),





    /*
    ---------------------------------------------------------------------------
      START DRAG
    ---------------------------------------------------------------------------
    */

    /**
     * This needed be called from any "dragstart" event to really start drag session.
     *
     * @type member
     * @return {void}
     * @throws TODOC
     */
    startDrag : function()
    {
      if (!this._dragCache) {
        throw new Error("Invalid usage of startDrag. Missing dragInfo!");
      }

      // Update status flag
      this._dragCache.dragHandlerActive = true;

      // Internal storage of source widget
      this.setSourceWidget(this._dragCache.sourceWidget);

      // Add feedback widget
      if (this._feedbackWidget)
      {
        this._feedbackWidget.setVisibility(false);

        var doc = qx.ui.core.ClientDocument.getInstance();
        doc.add(this._feedbackWidget);
      }
    },




    /*
    ---------------------------------------------------------------------------
      FIRE IMPLEMENTATION FOR USER EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param fromWidget {var} TODOC
     * @param toWidget {var} TODOC
     * @param e {Event} TODOC
     * @return {void}
     */
    _fireUserEvents : function(fromWidget, toWidget, e)
    {
      if (fromWidget && fromWidget != toWidget && fromWidget.hasEventListeners("dragout")) {
        fromWidget.dispatchEvent(new qx.event.type.DragEvent("dragout", e, fromWidget, toWidget), true);
      }

      if (toWidget)
      {
        if (fromWidget != toWidget && toWidget.hasEventListeners("dragover")) {
          toWidget.dispatchEvent(new qx.event.type.DragEvent("dragover", e, toWidget, fromWidget), true);
        }

        if (toWidget.hasEventListeners("dragmove")) {
          toWidget.dispatchEvent(new qx.event.type.DragEvent("dragmove", e, toWidget, null), true);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      HANDLER FOR MOUSE EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * This wraps the mouse events to custom handlers.
     *
     * @type member
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    handleMouseEvent : function(e)
    {
      switch(e.getType())
      {
        case "mousedown":
          return this._handleMouseDown(e);

        case "mouseup":
          return this._handleMouseUp(e);

        case "mousemove":
          return this._handleMouseMove(e);
      }
    },


    /**
     * This starts the core drag and drop session.
     *
     * To really get drag and drop working you need to define
     * a function which you attach to "dragstart"-event, which
     * invokes at least this.startDrag()
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _handleMouseDown : function(e)
    {
      if (e.getDefaultPrevented() || !e.isLeftButtonPressed()) {
        return;
      }

      // Store initial dragCache
      this._dragCache =
      {
        startScreenX      : e.getScreenX(),
        startScreenY      : e.getScreenY(),
        pageX             : e.getPageX(),
        pageY             : e.getPageY(),
        sourceWidget      : e.getTarget(),
        sourceTopLevel    : e.getTarget().getTopLevelWidget(),
        dragHandlerActive : false,
        hasFiredDragStart : false
      };
    },


    /**
     * Handler for mouse move events
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _handleMouseMove : function(e)
    {
      // Return if dragCache was not filled before
      if (!this._dragCache) {
        return;
      }

      /*
        Default handling if drag handler is activated
      */

      if (this._dragCache.dragHandlerActive)
      {
        // Update page coordinates
        this._dragCache.pageX = e.getPageX();
        this._dragCache.pageY = e.getPageY();

        // Get current target
        var currentDropTarget = this.getDropTarget(e);

        // Update action
        this.setCurrentAction(currentDropTarget ? this._evalNewAction(e.isShiftPressed(), e.isCtrlPressed(), e.isAltPressed()) : null);

        // Fire user events
        this._fireUserEvents(this._dragCache.currentDropWidget, currentDropTarget, e);

        // Store current widget
        this._dragCache.currentDropWidget = currentDropTarget;

        // Update cursor icon
        this._renderCursor();

        // Update user feedback
        this._renderFeedbackWidget();
      }

      /*
        Initial activation and fire of dragstart
      */

      else if (!this._dragCache.hasFiredDragStart)
      {
        if (Math.abs(e.getScreenX() - this._dragCache.startScreenX) > 5 || Math.abs(e.getScreenY() - this._dragCache.startScreenY) > 5)
        {
          // Fire dragstart event to finally allow the above if to handle next events
          this._dragCache.sourceWidget.dispatchEvent(new qx.event.type.DragEvent("dragstart", e, this._dragCache.sourceWidget), true);

          // Update status flag
          this._dragCache.hasFiredDragStart = true;

          // Look if handler become active
          if (this._dragCache.dragHandlerActive)
          {
            // Fire first user events
            this._fireUserEvents(this._dragCache.currentDropWidget, this._dragCache.sourceWidget, e);

            // Update status flags
            this._dragCache.currentDropWidget = this._dragCache.sourceWidget;

            // Activate capture for clientDocument
            qx.ui.core.ClientDocument.getInstance().setCapture(true);
          }
        }
      }
    },


    /**
     * Handle mouse up event. Normally this finalize the drag and drop event.
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _handleMouseUp : function(e)
    {
      // Return if dragCache was not filled before
      if (!this._dragCache) {
        return;
      }

      if (this._dragCache.dragHandlerActive) {
        this._endDrag(this.getDropTarget(e), e);
      }
      else
      {
        // Clear drag cache
        this._dragCache = null;
      }
    },




    /*
    ---------------------------------------------------------------------------
      HANDLER FOR KEY EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * This wraps the key events to custom handlers.
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    handleKeyEvent : function(e)
    {
      if (!this._dragCache) {
        return;
      }

      switch(e.getType())
      {
        case "keydown":
          this._handleKeyDown(e);
          return;

        case "keyup":
          this._handleKeyUp(e);
          return;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _handleKeyDown : function(e)
    {
      // Stop Drag on Escape
      if (e.getKeyIdentifier() == "Escape") {
        this.cancelDrag(e);
      }

      // Update cursor and action on press of modifier keys
      else if (this.getCurrentAction() != null)
      {
        // TODO this doesn't work in WebKit because WebKit doesn't fire keyevents for modifier keys
        switch(e.getKeyIdentifier())
        {
          case "Shift":
          case "Control":
          case "Alt":
            this.setAction(this._evalNewAction(e.isShiftPressed(), e.isCtrlPressed(), e.isAltPressed()));
            this._renderCursor();

            e.preventDefault();
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _handleKeyUp : function(e)
    {
      // TODO this doesn't work in WebKit because WebKit doesn't fire keyevents for modifier keys
      var bShiftPressed = e.getKeyIdentifier() == "Shift";
      var bCtrlPressed = e.getKeyIdentifier() == "Control";
      var bAltPressed = e.getKeyIdentifier() == "Alt";

      if (bShiftPressed || bCtrlPressed || bAltPressed)
      {
        if (this.getCurrentAction() != null)
        {
          this.setAction(this._evalNewAction(!bShiftPressed && e.isShiftPressed(), !bCtrlPressed && e.isCtrlPressed(), !bAltPressed && e.isAltPressed()));
          this._renderCursor();

          e.preventDefault();
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      IMPLEMENTATION OF DRAG&DROP SESSION FINALISATION
    ---------------------------------------------------------------------------
    */

    /**
     * Cancel current drag and drop session
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    cancelDrag : function(e)
    {
      // Return if dragCache was not filled before
      if (!this._dragCache) {
        return;
      }

      if (this._dragCache.dragHandlerActive) {
        this._endDrag(null, e);
      }
      else
      {
        // Clear drag cache
        this._dragCache = null;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    globalCancelDrag : function()
    {
      if (this._dragCache && this._dragCache.dragHandlerActive) {
        this._endDragCore();
      }
    },


    /**
     * This will be called to the end of each drag and drop session
     *
     * @type member
     * @param currentDestinationWidget {var} TODOC
     * @param e {Event} TODOC
     * @return {void}
     */
    _endDrag : function(currentDestinationWidget, e)
    {
      // Use given destination widget
      if (currentDestinationWidget)
      {
        this._lastDestinationEvent = e;
        this.setDestinationWidget(currentDestinationWidget);
      }

      // Dispatch dragend event
      this.getSourceWidget().dispatchEvent(new qx.event.type.DragEvent("dragend", e, this.getSourceWidget(), currentDestinationWidget), true);

      // Fire dragout event
      this._fireUserEvents(this._dragCache && this._dragCache.currentDropWidget, null, e);

      // Call helper
      this._endDragCore();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _endDragCore : function()
    {
      // Cleanup feedback widget
      if (this._feedbackWidget)
      {
        var doc = qx.ui.core.ClientDocument.getInstance();
        doc.remove(this._feedbackWidget);

        if (this._feedbackAutoDispose) {
          this._feedbackWidget.dispose();
        }

        this._feedbackWidget = null;
      }

      // Remove cursor
      var oldCursor = this.getCursor();

      if (oldCursor)
      {
        oldCursor._style.display = "none";
        this.forceCursor(null);
      }

      this._cursorDeltaX = null;
      this._cursorDeltaY = null;

      // Reset drag cache for next drag and drop session
      if (this._dragCache)
      {
        this._dragCache.currentDropWidget = null;
        this._dragCache = null;
      }

      // Deactivate capture for clientDocument
      qx.ui.core.ClientDocument.getInstance().setCapture(false);

      // Cleanup data and actions
      this.clearData();
      this.clearActions();

      // Cleanup widgets
      this.setSourceWidget(null);
      this.setDestinationWidget(null);
    },




    /*
    ---------------------------------------------------------------------------
      IMPLEMENTATION OF CURSOR UPDATES
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the position of the cursor feedback (the icon showing whether dropping
     * is allowed at the current position and which action a drop will do).
     *
     * @type member
     * @param deltaX {int} The number of pixels the top-left corner of the
     *          cursor feedback should be away from the mouse cursor in x direction.
     * @param deltaY {int} The number of pixels the top-left corner of the
     *          cursor feedback should be away from the mouse cursor in y direction.
     * @return {void}
     */
    setCursorPosition : function(deltaX, deltaY)
    {
      this._cursorDeltaX = deltaX;
      this._cursorDeltaY = deltaY;
    },


    /**
     * Select and setup the current used cursor
     *
     * @type member
     * @return {void}
     */
    _renderCursor : function()
    {
      var vNewCursor;
      var vOldCursor = this.getCursor();

      switch(this.getCurrentAction())
      {
        case this._actionNames.move:
          vNewCursor = this._cursors.move;
          break;

        case this._actionNames.copy:
          vNewCursor = this._cursors.copy;
          break;

        case this._actionNames.alias:
          vNewCursor = this._cursors.alias;
          break;

        default:
          vNewCursor = this._cursors.nodrop;
      }

      // Hide old cursor
      if (vNewCursor != vOldCursor && vOldCursor != null) {
        vOldCursor._style.display = "none";
      }

      // Ensure that the cursor is created
      if (!vNewCursor._initialLayoutDone)
      {
        qx.ui.core.ClientDocument.getInstance().add(vNewCursor);
        qx.ui.core.Widget.flushGlobalQueues();
      }

      // Apply position with runtime style (fastest qooxdoo method)
      vNewCursor._applyRuntimeLeft(this._dragCache.pageX + ((this._cursorDeltaX != null) ? this._cursorDeltaX : this.getDefaultCursorDeltaX()));
      vNewCursor._applyRuntimeTop(this._dragCache.pageY + ((this._cursorDeltaY != null) ? this._cursorDeltaY : this.getDefaultCursorDeltaY()));

      // Finally show new cursor
      if (vNewCursor != vOldCursor) {
        vNewCursor._style.display = "";
      }

      // Store new cursor
      this.forceCursor(vNewCursor);
    },




    /*
    ---------------------------------------------------------------------------
      IMPLEMENTATION OF DROP TARGET VALIDATION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vWidget {var} TODOC
     * @return {boolean} TODOC
     */
    supportsDrop : function(vWidget)
    {
      var vTypes = vWidget.getDropDataTypes();

      if (!vTypes) {
        return false;
      }

      for (var i=0; i<vTypes.length; i++)
      {
        if (vTypes[i] in this._data) {
          return true;
        }
      }

      return false;
    },




    /*
    ---------------------------------------------------------------------------
      ACTION HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vAction {var} TODOC
     * @param vForce {var} TODOC
     * @return {void}
     */
    addAction : function(vAction, vForce)
    {
      this._actions[vAction] = true;

      // Defaults to first added action
      if (vForce || this.getCurrentAction() == null) {
        this.setCurrentAction(vAction);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    clearActions : function()
    {
      this._actions = {};
      this.setCurrentAction(null);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vAction {var} TODOC
     * @return {void}
     */
    removeAction : function(vAction)
    {
      delete this._actions[vAction];

      // Reset current action on remove
      if (this.getCurrentAction() == vAction) {
        this.setCurrentAction(null);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vAction {var} TODOC
     * @return {void}
     */
    setAction : function(vAction)
    {
      if (vAction != null && !(vAction in this._actions)) {
        this.addAction(vAction, true);
      } else {
        this.setCurrentAction(vAction);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vKeyShift {var} TODOC
     * @param vKeyCtrl {var} TODOC
     * @param vKeyAlt {var} TODOC
     * @return {var | null} TODOC
     */
    _evalNewAction : function(vKeyShift, vKeyCtrl, vKeyAlt)
    {
      if (vKeyShift && vKeyCtrl && this._actionNames.alias in this._actions) {
        return this._actionNames.alias;
      } else if (vKeyShift && vKeyAlt && this._actionNames.copy in this._actions) {
        return this._actionNames.copy;
      } else if (vKeyShift && this._actionNames.move in this._actions) {
        return this._actionNames.move;
      } else if (vKeyAlt && this._actionNames.alias in this._actions) {
        return this._actionNames.alias;
      } else if (vKeyCtrl && this._actionNames.copy in this._actions) {
        return this._actionNames.copy;
      }
      else
      {
        // Return the first action found
        for (var vAction in this._actions) {
          return vAction;
        }
      }

      return null;
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
     * @type member
     * @param widget {qx.ui.core.Widget} the feedback widget.
     * @param deltaX {int ? 10} the number of pixels the top-left corner of the widget
     *          should be away from the mouse cursor in x direction.
     * @param deltaY {int ? 10} the number of pixels the top-left corner of the widget
     *          should be away from the mouse cursor in y direction.
     * @param autoDisposeWidget {boolean} whether the widget should be disposed when
     *          dragging is finished or cancelled.
     * @return {void}
     */
    setFeedbackWidget : function(widget, deltaX, deltaY, autoDisposeWidget)
    {
      this._feedbackWidget = widget;
      this._feedbackDeltaX = (deltaX != null) ? deltaX : 10;
      this._feedbackDeltaY = (deltaY != null) ? deltaY : 10;
      this._feedbackAutoDispose = autoDisposeWidget ? true : false;
    },


    /**
     * Renders the user feedback widget at the correct location.
     *
     * @type member
     * @return {void}
     */
    _renderFeedbackWidget : function()
    {
      if (this._feedbackWidget)
      {
        this._feedbackWidget.setVisibility(true);

        // Apply position with runtime style (fastest qooxdoo method)
        this._feedbackWidget._applyRuntimeLeft(this._dragCache.pageX + this._feedbackDeltaX);
        this._feedbackWidget._applyRuntimeTop(this._dragCache.pageY + this._feedbackDeltaY);
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      // Reset drag cache for next drag and drop session
      if (this._dragCache)
      {
        this._dragCache.currentDropWidget = null;
        this._dragCache = null;
      }

      // Cleanup data and actions
      this._data = null;
      this._actions = null;
      this._actionNames = null;

      this._lastDestinationEvent = null;

      if (this._cursors)
      {
        if (this._cursors.move)
        {
          this._cursors.move.dispose();
          delete this._cursors.move;
        }

        if (this._cursors.copy)
        {
          this._cursors.copy.dispose();
          delete this._cursors.copy;
        }

        if (this._cursors.alias)
        {
          this._cursors.alias.dispose();
          delete this._cursors.alias;
        }

        if (this._cursors.nodrop)
        {
          this._cursors.nodrop.dispose();
          delete this._cursors.nodrop;
        }

        this._cursors = null;
      }

      return qx.manager.object.ObjectManager.prototype.dispose.call(this);
    }
  }
});
