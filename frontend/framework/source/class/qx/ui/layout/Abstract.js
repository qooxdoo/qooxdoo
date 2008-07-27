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
 * Base class for all layout managers.
 *
 * Custom layout manager must derive from
 * this class and implement the methods {@link #invalidateLayoutCache},
 * {@link #renderLayout} and {@link #getSizeHint}.
 */
qx.Class.define("qx.ui.layout.Abstract",
{
  extend : qx.core.Object,


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
     * Invalidate all layout relevant caches. Automatically deletes the size hint.
     *
     * @abstract
     * @type member
     * @return {void}
     */
    invalidateLayoutCache : function() {
      this.__sizeHint = null;
    },


    /**
     * Applies the children layout.
     *
     * @abstract
     * @type member
     * @param availWidth {Integer} Final width available for the content (in pixel)
     * @param availHeight {Integer} Final height available for the content (in pixel)
     * @return {void}
     */
    renderLayout : function(availWidth, availHeight) {
      this.warn("Missing renderLayout() implementation!");
    },


    /**
     * Computes the layout dimensions and possible ranges of these.
     *
     * @type member
     * @return {Map|null} The map with the preferred width/height and the allowed
     *   minimum and maximum values in cases where shrinking or growing
     *   is required. Can also return <code>null</code> when this detection
     *   is not supported by the layout.
     */
    getSizeHint : function()
    {
      if (this.__sizeHint) {
        return this.__sizeHint;
      }

      return this.__sizeHint = this._computeSizeHint();
    },


    /**
     * This computes the size hint of the layout and returns it.
     *
     * @abstract
     * @type member
     * @return {Map} The size hint.
     */
    _computeSizeHint : function() {
      return null;
    },


    /**
     * This method is called, on each child "add" and "remove" action and
     * whenever the layout data of a child is changed. The method should be used
     * to clear any children relavent chached data.
     *
     * @type member
     * @return {void}
     */
    invalidateChildrenCache : function() {
      this._invalidChildrenCache = true;
    },


    /**
     * Verifies the value of a layout property.
     *
     * Note: This method is only available in the debug builds.
     *
     * @signature function(item, name, value)
     * @param item {Object} The affected layout item
     * @param name {Object} Name of the layout property
     * @param value {Object} Value of the layout property
     */
    verifyLayoutProperty : qx.core.Variant.select("qx.debug",
    {
      "on" : function(item, name, value) {
        // empty implementation
      },

      "off" : null
    }),


    /**
     * Number of separators to render. This is mainly needed for instance managment and 
     * should be called by the layout manager before rendering the first child
     *
     * @param number {Integer} Number of separators needed. Often the children number minus one.
     */
    _configureSeparators : function(number) {
      this.__widget.configureSeparators(number);
    },

    
    /**
     * Renders a horizontal separator between two children
     *
     * @param lines {Color[]} Array of colors. Each color renders exactly one line. 
     *    This could only be length of one or two (simple or shaded separator)   
     * @param index {Integer} Which separator should be used
     * @param left {Integer} Left position of the separator
     * @param height {Integer} The height of the separator
     */     
    _renderHorizontalSeparator : function(lines, index, left, height) {
      this.__widget.renderHorizontalSeparator(lines, index, left, height);
    },
    

    /**
     * Renders a vertical separator between two children
     *
     * @param lines {Color[]} Array of colors. Each color renders exactly one line. 
     *    This could only be length of one or two (simple or shaded separator)   
     * @param index {Integer} Which separator should be used
     * @param top {Integer} Top position of the separator
     * @param width {Integer} The width of the separator
     */     
    _renderVerticalSeparator : function(lines, index, top, width) {
      this.__widget.renderVerticalSeparator(lines, index, top, width);
    },
    

    /**
     * This method is called by the widget to connect the widget with the layout.
     *
     * @param widget {qx.ui.core.Widget} The widget to connect to.
     */
    connectToWidget : function(widget)
    {
      if (widget && this.__widget) {
        throw new Error("It is not possible to manually set the connected widget.");
      }

      this.__widget = widget;

      // Invalidate cache
      this.invalidateChildrenCache();
    },


    /**
     * Indicate that the layout has layout changed and propagate this information
     * up the widget hierarchy.
     *
     * Also a generic property apply method for all layout relevant properties.
     */
    _applyLayoutChange : function()
    {
      if (this.__widget) {
        qx.ui.core.queue.Layout.add(this.__widget);
      }
    },


    /**
     * Returns the list of all layout relevant children.
     *
     * @type member
     * @return {Array} List of layout relevant children.
     */
    _getLayoutChildren : function() {
      return this.__widget.getLayoutChildren();
    },


    /**
     * Whether the given layout item is a layout child
     * of the connected widget.
     *
     * @type member
     * @param item {qx.ui.core.LayoutItem} The layout item to test
     * @return {Boolean} <code>true</code> when the given item is a
     *   child of the connected widget.
     */
    _isLayoutChild : function(item) {
      return item.getLayoutParent() === this.__widget;
    }
  },





  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__widget");
  }
});
