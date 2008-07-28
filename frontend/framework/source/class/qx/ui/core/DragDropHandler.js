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
     * Alexander Back (aback)

************************************************************************ */


/**
 * This manager (singleton) manage all drag and drop handling
 */
qx.Class.define("qx.ui.core.DragDropHandler",
{
  type : "singleton",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__data = {};
    this.__actions = {};
    
    var root = qx.core.Init.getApplication().getRoot();

    // create the cursors
    // setup the combined image and change later only the source
    // this way there is only one image class needed instead of four
    this.__cursor = new qx.ui.basic.Image;
    this.__cursor.set({
      appearance : "cursors-dnd",
      zIndex     : 1e8
    });
    root.add(this.__cursor, { left : -50, top : -50 });
    
    // add listeners - "mousemove" is added/removed dynamically
    qx.event.Registration.addListener(root, "mousedown", this._handleMouseDown, this, true);
    qx.event.Registration.addListener(root, "mouseup", this._handleMouseUp, this, true);
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
      check : "qx.ui.core.Widget",
      nullable : true
    },

    destinationWidget :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applyDestinationWidget"
    },

    currentAction :
    {
      check : "String",
      nullable : true,
      event : "changeCurrentAction"
    },


    /**
     * The default delta left of the cursor feedback.
     *
     * @see #setCursorPosition
     */
    defaultCursorDeltaLeft :
    {
      check : "Integer",
      init : 5
    },


    /**
     * The default delta top of the cursor feedback.
     *
     * @see #setCursorPosition
     */
    defaultCursorDeltaTop :
    {
      check : "Integer",
      init : 15
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __lastDestinationEvent : null,




    /*
    ---------------------------------------------------------------------------
      COMMON MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyDestinationWidget : function(value, old)
    {
      if (value)
      {
        qx.event.Registration.fireEvent(value, "dragdrop", qx.event.type.Drag, [ this.__lastDestinationEvent, value, this.getSourceWidget() ]);
        this.__lastDestinationEvent = null;
      }
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
    addData : function(vMimeType, vData)
    {
      this.__data[vMimeType] = vData;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vMimeType {var} TODOC
     * @return {var} TODOC
     */
    getData : function(vMimeType)
    {
      return this.__data[vMimeType];
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    clearData : function() {
      this.__data = {};
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
        if (vDropDataTypes[i] in this.__data) {
          vDropTypes.push(vDropDataTypes[i]);
        }
      }

      return vDropTypes;
    },

    /**
     * @signature function(e)
     */
    getDropTarget : qx.core.Variant.select("qx.client",
    {
      // This hack is no longer needed for Firefox 2.0
      // We should verify, which Firefox version needed this hack.
      /*
      "gecko" : function(e)
      {
        var vCurrent = e.getTarget();

        // work around gecko bug (all other browsers are correct)
        // clicking on a free space and drag prohibit the get of
        // a valid event target. The target is always the element
        // which was the one with the mousedown event before.
        if (vCurrent == this.__dragCache.sourceWidget) {
          vCurrent = qx.legacy.event.handler.EventHandler.getTargetObject(qx.legacy.html.ElementFromPoint.getElementFromPoint(e.getPageX(), e.getPageY()));
        } else {
          vCurrent = qx.legacy.event.handler.EventHandler.getTargetObject(null, vCurrent);
        }

        while (vCurrent != null)
        {
          if (!vCurrent.supportsDrop(this.__dragCache)) {
            return null;
          }

          if (this.supportsDrop(vCurrent)) {
            return vCurrent;
          }

          vCurrent = vCurrent.getParent();
        }

        return null;
      },
      */

      "default" : function(e)
      {
        var vCurrent = e.getTarget();
        
        while (vCurrent != null)
        {
          if (!vCurrent.supportsDrop(this.__dragCache)) {
            return null;
          }

          if (this.supportsDrop(vCurrent)) {
            return vCurrent;
          }

          vCurrent = vCurrent.getLayoutParent();
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
      if (!this.__dragCache) {
        throw new Error("Invalid usage of startDrag. Missing dragInfo!");
      }

      // Update status flag
      this.__dragCache.dragHandlerActive = true;

      // Internal storage of source widget
      this.setSourceWidget(this.__dragCache.sourceWidget);

      // Add feedback widget
      if (this.__feedbackWidget)
      {
        this.__feedbackWidget.hide();

        qx.core.Init.getApplication().getRoot().add(this.__feedbackWidget);
        this.__feedbackWidget.setZIndex(1e8);
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
      if (fromWidget && fromWidget != toWidget) {
        qx.event.Registration.fireEvent(fromWidget, "dragout", qx.event.type.Drag, [ e, fromWidget, toWidget ]);
      }

      if (toWidget)
      {
        if (fromWidget != toWidget) {
          qx.event.Registration.fireEvent(toWidget, "dragover", qx.event.type.Drag, [ e, toWidget, fromWidget ]);
        }

        qx.event.Registration.fireEvent(toWidget, "dragmove", qx.event.type.Drag, [ e, toWidget, null ]);
      }
    },




    /*
    ---------------------------------------------------------------------------
      HANDLER FOR MOUSE EVENTS
    ---------------------------------------------------------------------------
    */


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
      if (!e.isLeftPressed()) {
        return;
      }
      
      // register mousemove listener
      qx.event.Registration.addListener(qx.core.Init.getApplication().getRoot(), "mousemove", this._handleMouseMove, this, true);
      
      // Store initial dragCache
      this.__dragCache = {
        // coordinates from the original mouse event
        documentLeft    : e.getDocumentLeft(),
        documentTop     : e.getDocumentTop(),
        
        // getter to harmonize the interface of the dragCache object with mouse event
        getDocumentLeft : function(){ return this.documentLeft; },
        getDocumentLeft : function(){ return this.documentTop; },
        
        // additional infos used inside the handler
        startScreenLeft   : e.getScreenLeft(),
        startScreenTop    : e.getScreenTop(),
        sourceWidget      : e.getTarget(),
        sourceTopLevel    : e.getTarget()._getRoot(), // TODO: alternative to this?
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
      if (!this.__dragCache) {
        return;
      }

      /*
        Default handling if drag handler is activated
      */
      if (this.__dragCache.dragHandlerActive)
      {
        // Update page coordinates
        this.__dragCache.documentLeft = e.getDocumentLeft();
        this.__dragCache.documentTop  = e.getDocumentTop();

        // Get current target
        var currentDropTarget = this.getDropTarget(e);
        
        // Update action
        this.setCurrentAction(currentDropTarget ? this._evalNewAction(e.isShiftPressed(), e.isCtrlPressed(), e.isAltPressed()) : null);

        // Fire user events
        this._fireUserEvents(this.__dragCache.currentDropWidget, currentDropTarget, e);

        // Store current widget
        this.__dragCache.currentDropWidget = currentDropTarget;

        // Update cursor icon
        this._renderCursor();
        
        // Update user feedback
        this._renderFeedbackWidget();
        
        // stop the mousemove event
        e.stop();
      }

      /*
        Initial activation and fire of dragstart
      */

      else if (!this.__dragCache.hasFiredDragStart)
      {
        if (Math.abs(e.getScreenLeft() - this.__dragCache.startScreenLeft) > 5 || Math.abs(e.getScreenTop() - this.__dragCache.startScreenTop) > 5)
        {
          // Fire dragstart event to finally allow the above if to handle next events
          qx.event.Registration.fireEvent(this.__dragCache.sourceWidget, "dragstart", qx.event.type.Drag, [ e ]);
          
          // Update status flag
          this.__dragCache.hasFiredDragStart = true;

          // Look if handler become active
          if (this.__dragCache.dragHandlerActive)
          {
            // Fire first user events
            this._fireUserEvents(this.__dragCache.currentDropWidget, this.__dragCache.sourceWidget, e);

            // Update status flags
            this.__dragCache.currentDropWidget = this.__dragCache.sourceWidget;
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
      if (!this.__dragCache) {
        return;
      }

      if (this.__dragCache.dragHandlerActive) {
        this._endDrag(this.getDropTarget(e), e);
      }
      else
      {
        // Clear drag cache
        this.__dragCache = null;
      }
      
      // deregister "mousemove" listener
      qx.event.Registration.removeListener(qx.core.Init.getApplication().getRoot(), "mousemove", this._handleMouseMove, this, true);
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
      if (!this.__dragCache) {
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
      if (!this.__dragCache) {
        return;
      }

      if (this.__dragCache.dragHandlerActive) {
        this._endDrag(null, e);
      }
      else
      {
        // Clear drag cache
        this.__dragCache = null;
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
      if (this.__dragCache && this.__dragCache.dragHandlerActive) {
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
        this.__lastDestinationEvent = e;
        this.setDestinationWidget(currentDestinationWidget);
      }

      // Dispatch dragend event
      qx.event.Registration.fireEvent(this.getSourceWidget(), "dragend", qx.event.type.Drag, [ e, this.getSourceWidget(), currentDestinationWidget ]);

      // Fire dragout event
      this._fireUserEvents(this.__dragCache && this.__dragCache.currentDropWidget, null, e);

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
      if (this.__feedbackWidget)
      {
        qx.core.Init.getApplication().getRoot().remove(this.__feedbackWidget);

        if (this.__feedbackAutoDispose) {
          this.__feedbackWidget.dispose();
        }

        this.__feedbackWidget = null;
      }

      // Hide cursor
      this.__cursor.getContainerElement().hide();
      
      this._cursorDeltaLeft = null;
      this._cursorDeltaTop = null;

      // Reset drag cache for next drag and drop session
      if (this.__dragCache)
      {
        this.__dragCache.currentDropWidget = null;
        this.__dragCache = null;
      }

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
     * @param deltaLeft {int} The number of pixels the top-left corner of the
     *          cursor feedback should be away from the mouse cursor in x direction.
     * @param deltaTop {int} The number of pixels the top-left corner of the
     *          cursor feedback should be away from the mouse cursor in y direction.
     * @return {void}
     */
    setCursorPosition : function(deltaLeft, deltaTop)
    {
      this._cursorDeltaLeft = deltaLeft;
      this._cursorDeltaTop = deltaTop;
    },


    /**
     * Select and setup the current used cursor
     *
     * @type member
     * @return {void}
     */
    _renderCursor : function()
    {
      var action = this.getCurrentAction() == null ? "nodrop" : this.getCurrentAction();
      this.__cursor.setSource("decoration/cursors/" + action + ".gif");

      // Apply position with setDomLeft and setDomTop (fastest qooxdoo method)
      this.__cursor.setDomLeft(this.__dragCache.documentLeft + ((this._cursorDeltaLeft != null) ? this._cursorDeltaLeft : this.getDefaultCursorDeltaLeft()));
      this.__cursor.setDomTop(this.__dragCache.documentTop + ((this._cursorDeltaTop != null) ? this._cursorDeltaTop : this.getDefaultCursorDeltaTop()));

      // show the cursor
      this.__cursor.getContainerElement().show();
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
     */
    supportsDrop : function(vWidget)
    {
      var vTypes = vWidget.getDropDataTypes();
      
      if (!vTypes) {
        return false;
      }

      for (var i=0; i<vTypes.length; i++)
      {
        if (vTypes[i] in this.__data) {
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
      this.__actions[vAction] = true;

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
      this.__actions = {};
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
      delete this.__actions[vAction];

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
      if (vAction != null && !(vAction in this.__actions)) {
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
      if (vKeyShift && vKeyCtrl && "alias" in this.__actions) {
        return "alias";
      } else if (vKeyShift && vKeyAlt && "copy" in this.__actions) {
        return "copy";
      } else if (vKeyShift && "move" in this.__actions) {
        return "move";
      } else if (vKeyAlt && "alias" in this.__actions) {
        return "alias";
      } else if (vKeyCtrl && "copy" in this.__actions) {
        return "copy";
      }
      else
      {
        // Return the first action found
        for (var vAction in this.__actions) {
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
     * @param autoDisposeWidget {Boolean} whether the widget should be disposed when
     *          dragging is finished or cancelled.
     * @return {void}
     */
    setFeedbackWidget : function(widget, deltaX, deltaY, autoDisposeWidget)
    {
      this.__feedbackWidget = widget;
      this.__feedbackDeltaX = (deltaX != null) ? deltaX : 10;
      this.__feedbackDeltaY = (deltaY != null) ? deltaY : 10;
      this.__feedbackAutoDispose = autoDisposeWidget ? true : false;
    },


    /**
     * Renders the user feedback widget at the correct location.
     *
     * @type member
     * @return {void}
     */
    _renderFeedbackWidget : function()
    {
      if (this.__feedbackWidget)
      {
        this.__feedbackWidget.show();

        // Apply position with runtime style (fastest qooxdoo method)
        this.__feedbackWidget.setDomLeft(this.__dragCache.documentLeft + this.__feedbackDeltaX);
        this.__feedbackWidget.setDomTop(this.__dragCache.documentTop + this.__feedbackDeltaY);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("__feedbackWidget");
    this._disposeFields("__dragCache", "__data", "__actions", "__lastDestinationEvent");
  }
});