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
 * Base class for all layout managers. Custom layout manager must derive from
 * this class and implement the methods {@link #invalidateLayoutCache},
 * {@link #renderLayout} and {#getSizeHint}.
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
     * @internal
     * @type member
     * @return {void}
     */
    invalidateLayoutCache : function() {
      this._sizeHint = null;
    },


    /**
     * Applies the children layout.
     *
     * @internal
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
      if (this._sizeHint)
      {
        // this.debug("Cached size hint: ", this._sizeHint);
        return this._sizeHint;
      }

      this._sizeHint = this._computeSizeHint();
      // console.log("Computed size hint: ", this._sizeHint);

      return this._sizeHint;
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
     */
    invalidateChildrenCache : function() {
      // empty implementation
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    /**
     * This method is called by the widget to connect the widget with the layout.
     *
     * @internal
     * @param widget {qx.ui.core.Widget} The widget to connect to.
     */
    connectToWidget : function(widget)
    {
      if (widget && this.__widget) {
        throw new Error("It is not possible to manually set the connected widget.");
      }
      this.__widget = widget;
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


    _getLayoutChildren : function() {
      return this.__widget.getLayoutChildren();
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
