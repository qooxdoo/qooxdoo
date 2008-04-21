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
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      LAYOUT PROCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the widget's computed location and dimension as computed by
     * the layout manager.
     *
     * This function is guaranteed to return a correct value
     * during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     * @type member
     * @return {Map} The widget location and dimensions in pixel
     *    (if the layout is valid). Contains the keys
     *    <code>width</code>, <code>height</code>, <code>left</code> and
     *    <code>top</code>.
     */
    getBounds : function() {
      return this.__userBounds || this.__computedLayout || null;
    },


    /**
     * Used by the layouters to apply coordinates and dimensions.
     *
     * @type member
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
    renderLayout : function(left, top, width, height)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var msg = "Something went wrong with the layout of " + this.toString() + "!";
        this.assertInteger(left, "Wrong 'left' argument. " + msg);
        this.assertInteger(top, "Wrong 'top' argument. " + msg);
        this.assertInteger(width, "Wrong 'width' argument. " + msg);
        this.assertInteger(height, "Wrong 'height' argument. " + msg);
      }

      if (!this.__hasGivenHeight && this.hasHeightForWidth())
      {
        // Note: What when other stuff reproduces a reflow here.
        // Is this really correct to just check for null here?
        // Wouldn't it be more stable to re-calculate the
        // heightForWidth and compare it e.g. ignore it when
        // it has the same value than before?

        // Only try once for each layout iteration
        if (this.__computedHeightForWidth != null)
        {
          delete this.__computedHeightForWidth;
        }
        else
        {
          var flowHeight = this.getHeightForWidth(width);
          // this.debug("Height for width " + width + "px: " + height + "px => " + flowHeight + "px");

          if (height !== flowHeight)
          {
            this.__computedHeightForWidth = flowHeight;
            qx.ui.core.queue.Layout.add(this);

            // Fabian thinks this works flawlessly
            return;
          }
        }
      }

      // Dynamically create data structure for computed layout
      var computed = this.__computedLayout;
      if (!computed) {
        computed = this.__computedLayout = {};
      }

      // Detect changes
      var todo = 0;

      if (left !== computed.left || top !== computed.top) {
        todo += 1;
      }

      if (!this._hasValidLayout || width !== computed.width || height !== computed.height) {
        todo += 2;
      }

      computed.left = left;
      computed.top = top;
      computed.width = width;
      computed.height = height;

      this._hasValidLayout = true;
      return todo;
    },


    /**
     * Whether the widget is a layout root. If the widget is a layout root,
     * layout changes inside the widget will not be propagated up to the
     * layout root's parent.
     *
     * @return {Boolean} Whether the widget is a layout root.
     */
    isLayoutRoot : function() {
      return false;
    },


    /**
     * Whether the element should be rendered.
     *
     * @return {Boolean} Whether the widget should be rendered.
     */
    shouldBeLayouted : function() {
      return true;
    },


    /**
     * Whether the layout of this widget (to layout the children)
     * is valid.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code>
     */
    hasValidLayout : function() {
      return !!this._hasValidLayout;
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
    invalidateLayoutCache : function()
    {
      // this.debug("Mark widget layout invalid: " + this);
      this._hasValidLayout = false;

      // invalidateLayoutCache cached size hint
      this._sizeHint = null;
    },


    /**
     * Returns the recommended dimensions of the widget.
     *
     * Developer note: This method normally does not need to be refined. If you
     * develop a custom widget please customize {@link #_getContentHint} instead.
     *
     * @type member
     * @param compute {Boolean?true} Automatically compute size hint if currently not
     *   cached?
     * @return {Map} The map with the preferred width/height and the allowed
     *   minimum and maximum values in cases where shrinking or growing
     *   is required.
     */
    getSizeHint : function(compute)
    {
      var hint = this._sizeHint;
      if (hint) {
        return hint;
      }

      if (compute === false) {
        return null;
      }

      return this._sizeHint = this._computeSizeHint();
    },


    /**
     * Computes the size hint of the layout item.
     *
     * @type member
     * @return The map with the preferred width/height and the allowed
     *   minimum and maximum values.
     */
    _computeSizeHint : function() {
      throw new Error("Abstract method call: _computeSizeHint()");
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
     * Generic property apply method for layout relevant properties
     */
    _applyLayoutChange : function() {
      qx.ui.core.queue.Layout.add(this);
    },




    /*
    ---------------------------------------------------------------------------
      SUPPORT FOR USER BOUNDARIES
    ---------------------------------------------------------------------------
    */

    hasUserBounds : function() {
      return !!this.__userBounds;
    },


    setUserBounds : function(left, top, width, height)
    {
      this.__userBounds = {
        left: left,
        top: top,
        width: width,
        height: height
      };

      qx.ui.core.queue.Layout.add(this);
    },


    resetUserBounds : function()
    {
      delete this.__userBounds;
      qx.ui.core.queue.Layout.add(this);
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** {Map} Empty storage pool */
    __emptyProperties : {},


    /**
     * Stores the given layout properties
     *
     * @type member
     * @param props {Map} Incoming layout property data
     * @return {void}
     */
    setLayoutProperties : function(props)
    {
      var storage = this.__layoutProperties;
      if (!storage) {
        storage = this.__layoutProperties = {};
      }

      // Copy over values
      for (var key in props)
      {
        if (props[key] == null) {
          delete storage[key];
        } else {
          storage[key] = props[key];
        }
      }

      var parent = this.getLayoutParent();
      var layout = parent ? parent.getLayout() : null;

      if (layout)
      {
        // Verify values through underlying layout
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          for (var key in props) {
            layout.verifyLayoutProperty(this, key, props[key]);
          }
        }

        // Precomputed and cached children data need to be
        // rebuild on upcoming (re-)layout.
        layout.invalidateChildrenCache();

        qx.ui.core.queue.Layout.add(parent);
      }
    },


    /**
     * Returns currently stored layout properties
     *
     * @type member
     * @return {Map} Returns a map of layout properties
     */
    getLayoutProperties : function() {
      return this.__layoutProperties || this.__emptyProperties;
    },


    /**
     * Removes all stored layout properties.
     *
     * @type member
     * @return {void}
     */
    clearLayoutProperties : function() {
      delete this.__layoutProperties;
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
     * @type member
     * @return {qx.ui.core.Widget} The root widget (if available)
     */
    _getRoot : function()
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
    }
  }
});
