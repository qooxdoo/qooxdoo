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

/**
 * The base class of all items, which should be layed out using a layout manager
 * {@link qx.ui.layout.Abstract}.
 */
qx.Class.define("qx.ui.core.LayoutItem",
{
  type : "abstract",
  extend : qx.core.Object,



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Controls the visibility. Valid values are:
     *
     * <ul>
     *   <li><b>visible</b>: Render the widget</li>
     *   <li><b>hidden</b>: Hide the widget but don't relayout the widget's parent.</li>
     *   <li><b>excluded</b>: Hide the widget and relayout the parent as if the
     *     widget was not a child of its parent.</li>
     * </ul>
     */
    visibility :
    {
      check : ["visible", "hidden", "excluded"],
      init : "visible",
      apply : "_applyVisibility",
      event : "changeVisibility",
      nullable : false
    }
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
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Used by the layouters to re-apply coordinates and dimensions.
     *
     * @type member
     * @internal Only for layout system
     * @return {void}
     */
    updateLayout : function() {
      throw new Error("Abstract method call");
    },


    /**
     * Used by the layouters to apply coordinates and dimensions.
     *
     * @type member
     * @internal Only for layout system and managers
     * @param left {Integer} Any integer value for the left position,
     *   always in pixels
     * @param top {Integer} Any integer value for the top position,
     *   always in pixels
     * @param width {Integer} Any positive integer value for the width,
     *   always in pixels
     * @param height {Integer} Any positive integer value for the height,
     *   always in pixels
     * @return {void}
     */
    renderLayout : function(left, top, width, height) {
      throw new Error("Abstract method call");
    },


    /**
     * Whether the widget is a layout root. If the widget is a layout root,
     * layout changes inside the widget will not be propagated up to the
     * layout root's parent.
     *
     * @internal
     * @return {Boolean} Whether the widget is a layout root.
     */
    isLayoutRoot : function() {
      return false;
    },


    /**
     * Whether the layout of this widget (to layout the children)
     * is valid.
     *
     * @internal
     * @type member
     * @return {Boolean} Returns <code>true</code>
     */
    hasValidLayout : function() {
      throw new Error("Abstract method call");
    },


    /**
     * Indicate that the widget has layout changes and propagate this information
     * up the widget hierarchy.
     *
     * @type member
     */
    scheduleLayoutUpdate : function() {
      qx.ui.core.queue.Layout.add(this);
    },


    /**
     * Called by the layout manager to mark this widget's layout as invalid.
     * This function should clear all layout relevant caches.
     */
    invalidateLayoutCache : function() {
      throw new Error("Abstract method call");
    },


    /**
     * Returns the recommended dimensions of the widget.
     *
     * Developer note: This method normally does not need to be refined. If you
     * develop a custom widget please customize {@link #_getContentHint} instead.
     *
     * @type member
     * @return {Map} The map with the preferred width/height and the allowed
     *   minimum and maximum values in cases where shrinking or growing
     *   is required.
     */
    getSizeHint : function() {
      throw new Error("Abstract method call");
    },


    /**
     * Returns the lasted computed size hint. If no size hint has been computed
     * yet, null is returned.
     *
     * @return {Map|null} The last computed size hint or null.
     */
    getCachedSizeHint : function() {
      throw new Error("Abstract method call");
    },


    /**
     * Whether the widget supports height for width.
     *
     * @return {Boolean} Whether the widget supports height for width
     */
    hasHeightForWidth : function() {
      return false;
    },


    /**
     * If a widget want's to trade height for width it has to implenet this
     * method and return the preferred height of the widget if it is resized to
     * the given width. This function returns <code>null</code> if the widget
     * doe not support height for width.
     *
     * @param width {Integer} The widgets new width
     * @return {Integer} The desired widget height
     */
    getHeightForWidth : function(width) {
      return null;
    },


    /**
     * This method is called from the layout when the layout excludes or
     * includes this layout item.
     *
     * @type member
     * @param value {Boolean} <code>true</code> when the element gets included.
     *    Otherwise <code>false</code>.
     */
    layoutVisibilityModified : function(value) {
      // nothing to do here
    },




    /*
    ---------------------------------------------------------------------------
      HIERARCHY SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Get the widget's parent widget. Even if the widget has been added to a
     * layout, the parent is always a child of the containing widget. The parent
     * widget may be <code>null</code>.
     *
     * @return {qx.ui.core.Widget|null} The widget's parent.
     */
    getLayoutParent : function() {
      return this._parent || null;
    },


    /**
     * Set the widget's parent
     *
     * @internal: Should only be used by the layout managers
     * @param parent {qx.ui.core.Widget|null} The widget's new parent.
     */
    setLayoutParent : function(parent) {
      this._parent = parent;
    },


    /**
     * Whether the widget is a root widget and directly connected to
     * the DOM.
     *
     * @return {Boolean} whether the widget is a root widget
     */
    isRootWidget : function() {
      return false;
    },


    /**
     * Returns the root widget. The root widget is the widget which
     * is directly inserted into an existing DOM node at HTML level.
     * This is often the BODY element of a typical web page.
     *
     * @internal
     * @type member
     * @return {qx.ui.core.Widget|null} The root widget (if available)
     */
    getRoot : function()
    {
      var parent = this;

      while (parent)
      {
        if (parent.isRootWidget()) {
          return parent;
        }

        parent = parent._parent;
      }

      return null;
    },





    /*
    ---------------------------------------------------------------------------
      VISIBILITY SUPPORT
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyVisibility : function(value, old) {
      // nothing to be done here
    }
  }
});
