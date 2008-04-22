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
    /*
    ---------------------------------------------------------------------------
      DIMENSION
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the user provided minimal width.
     *
     * Also take a look at the related properties {@link #width} and {@link #maxWidth}.
     */
    minWidth :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the preferred width.
     *
     * The computed width may differ from the given width due to
     * stretching. Also take a look at the related properties
     * {@link #minWidth} and {@link #maxWidth}.
     */
    width :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the user provided maximal width.
     *
     * Also take a look at the related properties {@link #width} and {@link #minWidth}.
     */
    maxWidth :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the user provided minimal height..
     *
     * Also take a look at the related properties {@link #height} and {@link #maxHeight}.
     */
    minHeight :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the preferred height.
     *
     * The computed height may differ from the given height due to
     * stretching. Also take a look at the related properties
     * {@link #minHeight} and {@link #maxHeight}.
     */
    height :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },


    /**
     * Sets the user provided maximal height.
     *
     * Also take a look at the related properties {@link #height} and {@link #minHeight}.
     */
    maxHeight :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyLayoutChange",
      init : null,
      themeable : true
    },



    /*
    ---------------------------------------------------------------------------
      STRETCHING
    ---------------------------------------------------------------------------
    */

    /** Whether the item can grow horitontally. */
    allowGrowX :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Whether the item can shrink horitontally. */
    allowShrinkX :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Whether the item can grow vertically. */
    allowGrowY :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Whether the item can shrink vertically. */
    allowShrinkY :
    {
      check : "Boolean",
      apply : "_applyLayoutChange",
      init : true,
      themeable : true
    },


    /** Growing and shrinking in the horizontal direction */
    allowStretchX :
    {
      group : [ "allowGrowX", "allowShrinkX" ],
      mode : "shorthand",
      themeable: true
    },


    /** Growing and shringking in the vertical direction */
    allowStretchY :
    {
      group : [ "allowGrowY", "allowShrinkY" ],
      mode : "shorthand",
      themeable: true
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
      LAYOUT PROCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the computed location and dimension as computed by
     * the layout manager.
     *
     * This function is guaranteed to return a correct value
     * during a {@link #changeSize} or {@link #changePosition} event dispatch.
     *
     * @type member
     * @return {Map} The location and dimensions in pixel
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

      // Dynamically create data structure for computed layout
      var computed = this.__computedLayout;
      if (!computed) {
        computed = this.__computedLayout = {};
      }

      // Detect changes
      var changes = 0;

      if (left !== computed.left || top !== computed.top) {
        changes += 1;
      }

      if (width !== computed.width || height !== computed.height) {
        changes += 2;
      }

      if (!this._hasValidLayout) {
        changes += 4;
      }

      // Store computed values
      computed.left = left;
      computed.top = top;
      computed.width = width;
      computed.height = height;

      // Height for width support
      if (this.getHeight() == null && this._hasHeightForWidth())
      {
        var flowHeight = this._getHeightForWidth(width);

        if (flowHeight !== this.__computedHeightForWidth)
        {
          this.__computedHeightForWidth = flowHeight;
          qx.ui.core.queue.Layout.add(this);

          return changes&1;
        }
      }

      this._hasValidLayout = true;
      return changes;
    },


    /**
     * Whether the item is a layout root. If the item is a layout root,
     * layout changes inside the item will not be propagated up to the
     * layout root's parent.
     *
     * @return {Boolean} Whether the item is a layout root.
     */
    isLayoutRoot : function() {
      return false;
    },


    /**
     * Whether the element should be rendered.
     *
     * @return {Boolean} Whether the item should be rendered.
     */
    shouldBeLayouted : function() {
      return true;
    },


    /**
     * Whether the layout of this item (to layout the children)
     * is valid.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code>
     */
    hasValidLayout : function() {
      return !!this._hasValidLayout;
    },


    /**
     * Indicate that the item has layout changes and propagate this information
     * up the item hierarchy.
     *
     * @type member
     */
    scheduleLayoutUpdate : function() {
      qx.ui.core.queue.Layout.add(this);
    },


    /**
     * Called by the layout manager to mark this item's layout as invalid.
     * This function should clear all layout relevant caches.
     */
    invalidateLayoutCache : function()
    {
      // this.debug("Mark layout invalid!");
      this._hasValidLayout = false;

      // invalidateLayoutCache cached size hint
      this._sizeHint = null;
    },


    /**
     * Returns the recommended dimensions of the item.
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

      // Compute as defined
      var hint = this._sizeHint = this._computeSizeHint();

      // Respect height for width
      if (this.__computedHeightForWidth && this.getHeight() == null) {
        hint.height = this.__computedHeightForWidth;
      }

      // Support shrink
      if (!this.getAllowShrinkX()) {
        hint.minWidth = hint.width;
      } else if (hint.minWidth > hint.width) {
        hint.width = hint.minWidth;
      }

      if (!this.getAllowShrinkY()) {
        hint.minHeight = hint.height;
      } else if (hint.minHeight > hint.height) {
        hint.height = hint.minHeight;
      }

      // Support grow
      if (!this.getAllowGrowX()) {
        hint.maxWidth = hint.width;
      } else if (hint.width > hint.maxWidth) {
        hint.width = hint.maxWidth;
      }

      if (!this.getAllowGrowY()) {
        hint.maxHeight = hint.height;
      } else if (hint.height > hint.maxHeight) {
        hint.height = hint.maxHeight;
      }

      // Finally return
      return hint;
    },


    /**
     * Computes the size hint of the layout item.
     *
     * @type member
     * @return The map with the preferred width/height and the allowed
     *   minimum and maximum values.
     */
    _computeSizeHint : function()
    {
      var minWidth = this.getMinWidth() || 0;
      var minHeight = this.getMinHeight() || 0;

      var width = this.getWidth() || minWidth;
      var height = this.getHeight() || minHeight;

      var maxWidth = this.getMaxWidth() || Infinity;
      var maxHeight = this.getMaxHeight() || Infinity;

      return {
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth,
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight
      };
    },


    /**
     * Whether the item supports height for width.
     *
     * @return {Boolean} Whether the item supports height for width
     */
    _hasHeightForWidth : function() {
      return false;
    },


    /**
     * If a item wants to trade height for width it has to implenet this
     * method and return the preferred height of the item if it is resized to
     * the given width. This function returns <code>null</code> if the item
     * do not support height for width.
     *
     * @param width {Integer} The computed width
     * @return {Integer} The desired height
     */
    _getHeightForWidth : function(width) {
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
     * Get the items parent. Even if the item has been added to a
     * layout, the parent is always a child of the containing item. The parent
     * item may be <code>null</code>.
     *
     * @return {qx.ui.core.Widget|null} The parent.
     */
    getLayoutParent : function() {
      return this._parent || null;
    },


    /**
     * Set the parent
     *
     * @param parent {qx.ui.core.Widget|null} The new parent.
     */
    setLayoutParent : function(parent) {
      this._parent = parent;
    },


    /**
     * Whether the item is a root item and directly connected to
     * the DOM.
     *
     * @return {Boolean} Whether the item a root item
     */
    isRootWidget : function() {
      return false;
    },


    /**
     * Returns the root item. The root item is the item which
     * is directly inserted into an existing DOM node at HTML level.
     * This is often the BODY element of a typical web page.
     *
     * @type member
     * @return {qx.ui.core.Widget} The root item (if available)
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
