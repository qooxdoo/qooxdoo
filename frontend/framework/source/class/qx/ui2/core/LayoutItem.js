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
 * {@link qx.ui2.layout.Abstract}.
 */
qx.Class.define("qx.ui2.core.LayoutItem",
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
     * Controls the widget's visibility. Valid values are:
     *
     * <ul>
     *   <li><b>visible</b>: Render the widget</li>
     *   <li><b>hidden</b>: Hide the widget but don't relayout the widget's parent.</li>
     *   <li>
     *     <b>excluded</b>: Hide the widget and relayout the parent as if the
     *       widget was not a child of its parent.
     *   </li>
     * </ul>
     */
    visibility :
    {
      check : ["visible", "hidden", "excluded"],
      init : "visible",
      apply : "_applyVisibility",
      event : "changeVisibility",
      nullable : false
    },


    /**
     * If the layout manager decides not to render the widget it should turn
     * if its visibility using this property.
     *
     * @internal
     */
    layoutVisible :
    {
      check : "Boolean",
      init : true,
      apply : "_applyLayoutVisible",
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
     * Used by the layouters to apply coordinates and dimensions.
     *
     * @type member
     * @internal Only for layout managers
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
     * Indicate that the widget has layout changes and propagate this information
     * up the widget hierarchy.
     *
     * @internal
     * @type member
     */
    scheduleLayoutUpdate : function() {
      qx.ui2.core.LayoutQueue.add(this);
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
     * Called by the layout manager to mark this widget's layout as invalid.
     * This function should clear all layout relevant caches.
     *
     * @internal
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
     * Whether a widget is able to stretch on the x-axis. Some specific y-axis
     * oriented widgets may overwrite this e.g. ToolBarSeparator, ...
     *
     * Please note: This property is not overwritable by the widget user. It
     * may only be refined in a derived class. This way it gives the original
     * widget author the full control regarding flex grow/shrinking used by some
     * layout managers.
     *
     * The user can limit the stretching through the definition of a min- or
     * max-width. If these limits are reached the result of this function is
     * ignored.
     *
     * @type member
     * @return {Boolean} Whether the widget is able to stretch on the x-axis.
     */
    canStretchX : function() {
      return true;
    },


    /**
     * Whether a widget is able to stretch on the y-axis. Some specific x-axis
     * oriented widgets may overwrite this e.g. TextField, Spinner, ComboBox, ...
     *
     * Please note: This property is not overwritable by the widget user. It
     * may only be refined in a derived class. This way it gives the original
     * widget author the full control regarding flex grow/shrinking used by some
     * layout managers.
     *
     * The user can limit the stretching through the definition of a min- or
     * max-height. If these limits are reached the result of this function is
     * ignored.
     *
     * @type member
     * @return {Boolean} Whether the widget is able to stretch on the y-axis.
     */
    canStretchY : function() {
      return true;
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
     * @return {qx.ui2.core.Widget|null} The widget's parent.
     */
    getParent : function() {
      return this._parent || null;
    },


    /**
     * Set the widget's parent
     *
     * @internal: Should only be used by the layout managers
     * @param parent {qx.ui2.core.Widget|null} The widget's new parent.
     */
    setParent : function(parent) {
      this._parent = parent;
    },


    /**
     * Get the widget's nesting level. Top level widgets have a nesting level
     * of <code>0</code>.
     *
     * @internal
     * @return {Integer} The widgets nesting level.
     */
    getNestingLevel : function()
    {
      var level = -1;
      var parent = this;

      while (parent)
      {
        level += 1;
        parent = parent._parent;
      }

      return level;
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
     * @return {qx.ui2.core.Widget|null} The root widget (if available)
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

    /**
     * Check recursively whether the widget and all of its parent widgets
     * are visible.
     *
     * @return {Boolean} Whether the widget and all of its parent widgets are visible.
     */
    isVisible : function() {
      throw new Error("Abstract method call");
    },


    // property apply
    _applyVisibility : function(value, old) {
      // nothing to be done here
    },


    // property apply
    _applyLayoutVisible : function(value, old) {
      // nothing to be done here
    }
  }
});
