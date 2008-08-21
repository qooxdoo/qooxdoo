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
     * Fabian Jakobs (fjakobs)

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
     *     {@link #preventDefault}
     * @param originalEvent {qx.event.type.Mouse} The original (mouse) event to use
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(cancelable, originalEvent)
    {
      this.base(arguments, false, cancelable);

      if (originalEvent)
      {
        this._native = originalEvent.getNativeEvent() || null;
        this._originalTarget = originalEvent.getTarget() || null;
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
     * Get the horizontal position at which the event occured relative to the
     * left of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Integer} The horizontal mouse position in the document.
     * @signature function()
     */
    getDocumentLeft : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        if (this._native == null) {
          return 0;
        }

        var win = qx.dom.Node.getWindow(this._native.srcElement);
        return this._native.clientX + qx.bom.Viewport.getScrollLeft(win);
      },

      // opera, webkit and gecko
      "default" : function()
      {
        if (this._native == null) {
          return 0;
        }

        return this._native.pageX;
      }
    }),


    /**
     * Get the vertical position at which the event occured relative to the
     * top of the document. This property takes into account any scrolling of
     * the page.
     *
     * @return {Integer} The vertical mouse position in the document.
     * @signature function()
     */
    getDocumentTop : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        if (this._native == null) {
          return 0;
        }

        var win = qx.dom.Node.getWindow(this._native.srcElement);
        return this._native.clientY + qx.bom.Viewport.getScrollTop(win);
      },

      // opera, webkit and gecko
      "default" : function()
      {
        if (this._native == null) {
          return 0;
        }

        return this._native.pageY;
      }
    }),


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
     * @param type {String} Any of the supported types.
     */
    getData : function(type) {
      return this.getManager().getData(type);
    },


    /**
     * Returns the type which was requested last.
     * Used in the <code>droprequest</code> listener.
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
      return this.getManager().getCurrentAction();
    }
  }
});
