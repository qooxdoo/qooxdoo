/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Event object class for drag events
 */
qx.Class.define("qx.event.type.Drag",
{
  extend : qx.event.type.Event,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Initialize the fields of the event. The event must be initialized before
     * it can be dispatched.
     *
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link qx.event.type.Event#preventDefault}
     * @param originalEvent {qx.event.type.Track} The original (mouse) event to use
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(cancelable, originalEvent)
    {
      this.base(arguments, true, cancelable);

      if (originalEvent)
      {
        this._native = originalEvent.getNativeEvent() || null;
        this._originalTarget = originalEvent.getOriginalTarget() || null;
      }
      else
      {
        this._native = null;
        this._originalTarget = null;
      }

      return this;
    },


    // overridden
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone._native = this._native;

      return clone;
    },


    /**
     * Get the horizontal position at which the event occurred relative to the
     * left of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Integer} The horizontal mouse position in the document.
     */
    getDocumentLeft : function()
    {
      if (this._native == null) {
        return 0;
      }
      var x = this._native.pageX;
      if (x !== undefined) {
        // iOS 6 does not copy pageX over to the fake pointer event
        if (x == 0 && this._native.pointerType == "touch") {
          x = this._native._original.changedTouches[0].pageX || 0;
        }
        return Math.round(x);
      } else {
        var win = qx.dom.Node.getWindow(this._native.srcElement);
        return Math.round(this._native.clientX) + qx.bom.Viewport.getScrollLeft(win);
      }
    },


    /**
     * Get the vertical position at which the event occurred relative to the
     * top of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Integer} The vertical mouse position in the document.
     */
    getDocumentTop : function()
    {
      if (this._native == null) {
        return 0;
      }

      var y = this._native.pageY;
      if (y !== undefined) {
        // iOS 6 does not copy pageY over to the fake pointer event
        if (y == 0 && this._native.pointerType == "touch") {
          y = this._native._original.changedTouches[0].pageY || 0;
        }
        return Math.round(y);
      } else {
        var win = qx.dom.Node.getWindow(this._native.srcElement);
        return Math.round(this._native.clientY) + qx.bom.Viewport.getScrollTop(win);
      }
    },


    /**
     * Returns the drag&drop event handler responsible for the target
     *
     * @return {qx.event.handler.DragDrop} The drag&drop handler
     */
    getManager : function() {
      return qx.event.Registration.getManager(this.getTarget()).getHandler(qx.event.handler.DragDrop);
    },


    /**
     * Used during <code>dragstart</code> listener to
     * inform the manager about supported data types.
     *
     * @param type {String} Data type to add to list of supported types
     */
    addType : function(type) {
      this.getManager().addType(type);
    },


    /**
     * Used during <code>dragstart</code> listener to
     * inform the manager about supported drop actions.
     *
     * @param action {String} Action to add to the list of supported actions
     */
    addAction : function(action) {
      this.getManager().addAction(action);
    },


    /**
     * Whether the given type is supported by the drag
     * target (source target).
     *
     * This is used in the event listeners for <code>dragover</code>
     * or <code>dragdrop</code>.
     *
     * @param type {String} The type to look for
     * @return {Boolean} Whether the given type is supported
     */
    supportsType : function(type) {
      return this.getManager().supportsType(type);
    },


    /**
     * Whether the given action is supported by the drag
     * target (source target).
     *
     * This is used in the event listeners for <code>dragover</code>
     * or <code>dragdrop</code>.
     *
     * @param action {String} The action to look for
     * @return {Boolean} Whether the given action is supported
     */
    supportsAction : function(action) {
      return this.getManager().supportsAction(action);
    },


    /**
     * Adds data of the given type to the internal storage. The data
     * is available until the <code>dragend</code> event is fired.
     *
     * @param type {String} Any valid type
     * @param data {var} Any data to store
     */
    addData : function(type, data) {
      this.getManager().addData(type, data);
    },


    /**
     * Returns the data of the given type. Used in the <code>drop</code> listener.
     * 
     * Note that this is a synchronous method and if any of the drag and drop 
     * events handlers are implemented using Promises, this may fail; @see
     * `getDataAsync`.
     *
     * @param type {String} Any of the supported types.
     * @return {var} The data for the given type
     */
    getData : function(type) {
      return this.getManager().getData(type);
    },


    /**
     * Returns the data of the given type. Used in the <code>drop</code> listener.
     * 
     * @param type {String} Any of the supported types.
     * @return {qx.Promise|var} The data for the given type
     */
    getDataAsync : function(type) {
      return this.getManager().getDataAsync(type);
    },


    /**
     * Returns the type which was requested last, to be used
     * in the <code>droprequest</code> listener.
     *
     * @return {String} The last requested data type
     */
    getCurrentType : function() {
      return this.getManager().getCurrentType();
    },


    /**
     * Returns the currently selected action. Depends on the
     * supported actions of the source target and the modification
     * keys pressed by the user.
     *
     * Used in the <code>droprequest</code> listener.
     *
     * @return {String} The action. May be one of <code>move</code>,
     *    <code>copy</code> or <code>alias</code>.
     */
    getCurrentAction : function() {
      if (this.getDefaultPrevented()) {
        return null;
      }
      return this.getManager().getCurrentAction();
    },

    /**
     * Returns the currently selected action. Depends on the
     * supported actions of the source target and the modification
     * keys pressed by the user.
     *
     * Used in the <code>droprequest</code> listener.
     *
     * @return {qx.Promise|String} The action. May be one of <code>move</code>,
     *    <code>copy</code> or <code>alias</code>.
     */
    getCurrentActionAsync : function() {
      if (this.getDefaultPrevented()) {
        return null;
      }
      return this.getManager().getCurrentActionAsync();
    },

    /**
     * Whether the current drop target allows the current drag target.
     *
     * This can be called from within the "drag" event to enable/disable
     * a drop target selectively, for example based on the child item,
     * above and beyond the one-time choice made by the the "dragover"
     * event for the droppable widget itself.
     *
     * @param isAllowed {Boolean} False if a drop should be disallowed
     */
    setDropAllowed : function(isAllowed) {
      this.getManager().setDropAllowed(isAllowed);
    },


    /**
     * Returns the target which has been initially tapped on.
     * @return {qx.ui.core.Widget} The tapped widget.
     */
    getDragTarget : function() {
      return this.getManager().getDragTarget();
    },


    /**
     * Stops the drag&drop session and fires a <code>dragend</code> event.
     */
    stopSession : function() {
      this.getManager().clearSession();
    }
  }
});
