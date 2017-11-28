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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The base class of all items, which should be laid out using a layout manager
 * {@link qx.ui.layout.Abstract}.
 */
qx.Class.define("qx.ui.core.LayoutItem",
{
  type : "abstract",
  extend : qx.core.Object,

  construct : function() {
    this.base(arguments);

    // dynamic theme switch
    if (qx.core.Environment.get("qx.dyntheme")) {
      qx.theme.manager.Meta.getInstance().addListener("changeTheme", this._onChangeTheme, this);
    }
  },



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
     * The user provided minimal width.
     *
     * Also take a look at the related properties {@link #width} and {@link #maxWidth}.
     */
    minWidth :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyDimension",
      init : null,
      themeable : true
    },


    /**
     * The <code>LayoutItem</code>'s preferred width.
     *
     * The computed width may differ from the given width due to
     * stretching. Also take a look at the related properties
     * {@link #minWidth} and {@link #maxWidth}.
     */
    width :
    {
      check : "Integer",
      event : "changeWidth",
      nullable : true,
      apply : "_applyDimension",
      init : null,
      themeable : true
    },


    /**
     * The user provided maximal width.
     *
     * Also take a look at the related properties {@link #width} and {@link #minWidth}.
     */
    maxWidth :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyDimension",
      init : null,
      themeable : true
    },


    /**
     * The user provided minimal height.
     *
     * Also take a look at the related properties {@link #height} and {@link #maxHeight}.
     */
    minHeight :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyDimension",
      init : null,
      themeable : true
    },


    /**
     * The item's preferred height.
     *
     * The computed height may differ from the given height due to
     * stretching. Also take a look at the related properties
     * {@link #minHeight} and {@link #maxHeight}.
     */
    height :
    {
      check : "Integer",
      event : "changeHeight",
      nullable : true,
      apply : "_applyDimension",
      init : null,
      themeable : true
    },


    /**
     * The user provided maximum height.
     *
     * Also take a look at the related properties {@link #height} and {@link #minHeight}.
     */
    maxHeight :
    {
      check : "Integer",
      nullable : true,
      apply : "_applyDimension",
      init : null,
      themeable : true
    },





    /*
    ---------------------------------------------------------------------------
      STRETCHING
    ---------------------------------------------------------------------------
    */

    /** Whether the item can grow horizontally. */
    allowGrowX :
    {
      check : "Boolean",
      apply : "_applyStretching",
      init : true,
      themeable : true
    },


    /** Whether the item can shrink horizontally. */
    allowShrinkX :
    {
      check : "Boolean",
      apply : "_applyStretching",
      init : true,
      themeable : true
    },


    /** Whether the item can grow vertically. */
    allowGrowY :
    {
      check : "Boolean",
      apply : "_applyStretching",
      init : true,
      themeable : true
    },


    /** Whether the item can shrink vertically. */
    allowShrinkY :
    {
      check : "Boolean",
      apply : "_applyStretching",
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


    /** Growing and shrinking in the vertical direction */
    allowStretchY :
    {
      group : [ "allowGrowY", "allowShrinkY" ],
      mode : "shorthand",
      themeable: true
    },





    /*
    ---------------------------------------------------------------------------
      MARGIN
    ---------------------------------------------------------------------------
    */

    /** Margin of the widget (top) */
    marginTop :
    {
      check : "Integer",
      init : 0,
      apply : "_applyMargin",
      themeable : true
    },


    /** Margin of the widget (right) */
    marginRight :
    {
      check : "Integer",
      init : 0,
      apply : "_applyMargin",
      themeable : true
    },


    /** Margin of the widget (bottom) */
    marginBottom :
    {
      check : "Integer",
      init : 0,
      apply : "_applyMargin",
      themeable : true
    },


    /** Margin of the widget (left) */
    marginLeft :
    {
      check : "Integer",
      init : 0,
      apply : "_applyMargin",
      themeable : true
    },


    /**
     * The 'margin' property is a shorthand property for setting 'marginTop',
     * 'marginRight', 'marginBottom' and 'marginLeft' at the same time.
     *
     * If four values are specified they apply to top, right, bottom and left respectively.
     * If there is only one value, it applies to all sides, if there are two or three,
     * the missing values are taken from the opposite side.
     */
    margin :
    {
      group : [ "marginTop", "marginRight", "marginBottom", "marginLeft" ],
      mode  : "shorthand",
      themeable : true
    },




    /*
    ---------------------------------------------------------------------------
      ALIGN
    ---------------------------------------------------------------------------
    */

    /**
     * Horizontal alignment of the item in the parent layout.
     *
     * Note: Item alignment is only supported by {@link LayoutItem} layouts where
     * it would have a visual effect. Except for {@link Spacer}, which provides
     * blank space for layouts, all classes that inherit {@link LayoutItem} support alignment.
     */
    alignX :
    {
      check : [ "left", "center", "right" ],
      nullable : true,
      apply : "_applyAlign",
      themeable: true
    },


    /**
     * Vertical alignment of the item in the parent layout.
     *
     * Note: Item alignment is only supported by {@link LayoutItem} layouts where
     * it would have a visual effect. Except for {@link Spacer}, which provides
     * blank space for layouts, all classes that inherit {@link LayoutItem} support alignment.
     */
    alignY :
    {
      check : [ "top", "middle", "bottom", "baseline" ],
      nullable : true,
      apply : "_applyAlign",
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
      DYNAMIC THEME SWITCH SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Handler for the dynamic theme change.
     * @signature function()
     */
    _onChangeTheme : qx.core.Environment.select("qx.dyntheme",
    {
      "true" : function() {
        // reset all themeable properties
        var props = qx.util.PropertyUtil.getAllProperties(this.constructor);
        for (var name in props) {
          var desc = props[name];
          // only themeable properties not having a user value
          if (desc.themeable) {
            var userValue = qx.util.PropertyUtil.getUserValue(this, name);
            if (userValue == null) {
              qx.util.PropertyUtil.resetThemed(this, name);
            }
          }
        }
      },
      "false" : null
    }),




    /*
    ---------------------------------------------------------------------------
      LAYOUT PROCESS
    ---------------------------------------------------------------------------
    */

    /** @type {Integer} The computed height */
    __computedHeightForWidth : null,

    /** @type {Map} The computed size of the layout item */
    __computedLayout : null,

    /** @type {Boolean} Whether the current layout is valid */
    __hasInvalidLayout : null,

    /** @type {Map} Cached size hint */
    __sizeHint : null,

    /** @type {Boolean} Whether the margins have changed and must be updated */
    __updateMargin : null,

    /** @type {Map} user provided bounds of the widget, which override the layout manager */
    __userBounds : null,

    /** @type {Map} The item's layout properties */
    __layoutProperties : null,


    /**
     * Get the computed location and dimension as computed by
     * the layout manager.
     *
     * @return {Map} The location and dimensions in pixel
     *    (if the layout is valid). Contains the keys
     *    <code>width</code>, <code>height</code>, <code>left</code> and
     *    <code>top</code>.
     */
    getBounds : function() {
      return this.__userBounds || this.__computedLayout || null;
    },


    /**
     * Reconfigure number of separators
     */
    clearSeparators : function() {
      // empty template
    },


    /**
     * Renders a separator between two children
     *
     * @param separator {String|qx.ui.decoration.IDecorator} The separator to render
     * @param bounds {Map} Contains the left and top coordinate and the width and height
     *    of the separator to render.
     */
    renderSeparator : function(separator, bounds) {
      // empty template
    },


    /**
     * Used by the layout engine to apply coordinates and dimensions.
     *
     * @param left {Integer} Any integer value for the left position,
     *   always in pixels
     * @param top {Integer} Any integer value for the top position,
     *   always in pixels
     * @param width {Integer} Any positive integer value for the width,
     *   always in pixels
     * @param height {Integer} Any positive integer value for the height,
     *   always in pixels
     * @return {Map} A map of which layout sizes changed.
     */
    renderLayout : function(left, top, width, height)
    {
      // do not render if the layout item is already disposed
      if (this.isDisposed()) {
        return null;
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        var msg = "Something went wrong with the layout of " + this.toString() + "!";
        this.assertInteger(left, "Wrong 'left' argument. " + msg);
        this.assertInteger(top, "Wrong 'top' argument. " + msg);
        this.assertInteger(width, "Wrong 'width' argument. " + msg);
        this.assertInteger(height, "Wrong 'height' argument. " + msg);

        // this.assertInRange(width, this.getMinWidth() || -1, this.getMaxWidth() || 32000);
        // this.assertInRange(height, this.getMinHeight() || -1, this.getMaxHeight() || 32000);
      }



      // Height for width support
      // Results into a relayout which means that width/height is applied in the next iteration.
      var flowHeight = null;
      if (this.getHeight() == null && this._hasHeightForWidth()) {
        var flowHeight = this._getHeightForWidth(width);
      }

      if (flowHeight != null && flowHeight !== this.__computedHeightForWidth)
      {
        // This variable is used in the next computation of the size hint
        this.__computedHeightForWidth = flowHeight;

        // Re-add to layout queue
        qx.ui.core.queue.Layout.add(this);

        return null;
      }

      // Detect size changes

      // Dynamically create data structure for computed layout
      var computed = this.__computedLayout;
      if (!computed) {
        computed = this.__computedLayout = {};
      }

      // Detect changes
      var changes = {};

      if (left !== computed.left || top !== computed.top)
      {
        changes.position = true;

        computed.left = left;
        computed.top = top;
      }

      if (width !== computed.width || height !== computed.height)
      {
        changes.size = true;

        computed.width = width;
        computed.height = height;
      }

      // Clear invalidation marker
      if (this.__hasInvalidLayout)
      {
        changes.local = true;
        delete this.__hasInvalidLayout;
      }

      if (this.__updateMargin)
      {
        changes.margin = true;
        delete this.__updateMargin;
      }

      // Returns changes, especially for deriving classes
      return changes;
    },


    /**
     * Whether the item should be excluded from the layout
     *
     * @return {Boolean} Should the item be excluded by the layout
     */
    isExcluded : function() {
      return false;
    },


    /**
     * Whether the layout of this item (to layout the children)
     * is valid.
     *
     * @return {Boolean} Returns <code>true</code>
     */
    hasValidLayout : function() {
      return !this.__hasInvalidLayout;
    },


    /**
     * Indicate that the item has layout changes and propagate this information
     * up the item hierarchy.
     *
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

      this.__hasInvalidLayout = true;
      this.__sizeHint = null;
    },


    /**
     * A size hint computes the dimensions of a widget. It returns
     * the recommended dimensions as well as the min and max dimensions.
     * The min and max values already respect the stretching properties.
     *
     * <h3>Wording</h3>
     * <ul>
     * <li>User value: Value defined by the widget user, using the size properties</li>
     *
     * <li>Layout value: The value computed by {@link qx.ui.core.Widget#_getContentHint}</li>
     * </ul>
     *
     * <h3>Algorithm</h3>
     * <ul>
     * <li>minSize: If the user min size is not null, the user value is taken,
     *     otherwise the layout value is used.</li>
     *
     * <li>(preferred) size: If the user value is not null the user value is used,
     *     otherwise the layout value is used.</li>
     *
     * <li>max size: Same as the preferred size.</li>
     * </ul>
     *
     * @param compute {Boolean?true} Automatically compute size hint if currently not
     *   cached?
     * @return {Map} The map with the preferred width/height and the allowed
     *   minimum and maximum values in cases where shrinking or growing
     *   is required.
     */
    getSizeHint : function(compute)
    {
      var hint = this.__sizeHint;
      if (hint) {
        return hint;
      }

      if (compute === false) {
        return null;
      }

      // Compute as defined
      hint = this.__sizeHint = this._computeSizeHint();

      // Respect height for width
      if (this._hasHeightForWidth() && this.__computedHeightForWidth && this.getHeight() == null) {
        hint.height = this.__computedHeightForWidth;
      }


      // normalize width
      if (hint.minWidth > hint.width) {
        hint.width = hint.minWidth;
      }
      if (hint.maxWidth < hint.width) {
        hint.width = hint.maxWidth;
      }

      if (!this.getAllowGrowX()) {
        hint.maxWidth = hint.width;
      }
      if (!this.getAllowShrinkX()) {
        hint.minWidth = hint.width;
      }


      // normalize height
      if (hint.minHeight > hint.height) {
        hint.height = hint.minHeight;
      }
      if (hint.maxHeight < hint.height) {
        hint.height = hint.maxHeight;
      }

      if (!this.getAllowGrowY()) {
        hint.maxHeight = hint.height;
      }
      if (!this.getAllowShrinkY()) {
        hint.minHeight = hint.height;
      }


      // Finally return
      return hint;
    },


    /**
     * Computes the size hint of the layout item.
     *
     * @return {Map} The map with the preferred width/height and the allowed
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
    _hasHeightForWidth : function()
    {
      var layout = this._getLayout();
      if (layout) {
        return layout.hasHeightForWidth();
      }
      return false;
    },


    /**
     * If an item wants to trade height for width it has to implement this
     * method and return the preferred height of the item if it is resized to
     * the given width. This function returns <code>null</code> if the item
     * do not support height for width.
     *
     * @param width {Integer} The computed width
     * @return {Integer} The desired height
     */
    _getHeightForWidth : function(width)
    {
      var layout = this._getLayout();
      if (layout && layout.hasHeightForWidth()) {
        return layout.getHeightForWidth(width);
      }

      return null;
    },


    /**
     * Get the widget's layout manager.
     *
     * @return {qx.ui.layout.Abstract} The widget's layout manager
     */
    _getLayout : function() {
      return null;
    },


    // property apply
    _applyMargin : function()
    {
      this.__updateMargin = true;

      var parent = this.$$parent;
      if (parent) {
        parent.updateLayoutProperties();
      }
    },


    // property apply
    _applyAlign : function()
    {
      var parent = this.$$parent;
      if (parent) {
        parent.updateLayoutProperties();
      }
    },


    // property apply
    _applyDimension : function() {
      if (qx.core.Environment.get("qx.debug")) {
        var minWidth = this.getMinWidth();
        var maxWidth = this.getMaxWidth();
        if (minWidth !== null && maxWidth !== null) {
          this.assert(minWidth <= maxWidth, "minWidth is larger than maxWidth!");
        }

        var minHeight = this.getMinHeight();
        var maxHeight = this.getMaxHeight();
        if (minHeight !== null && maxHeight !== null) {
          this.assert(minHeight <= maxHeight, "minHeight is larger than maxHeight!");
        }
      }

      qx.ui.core.queue.Layout.add(this);
    },


    // property apply
    _applyStretching : function() {
      qx.ui.core.queue.Layout.add(this);
    },






    /*
    ---------------------------------------------------------------------------
      SUPPORT FOR USER BOUNDARIES
    ---------------------------------------------------------------------------
    */

    /**
     * Whether user bounds are set on this layout item
     *
     * @return {Boolean} Whether user bounds are set on this layout item
     */
    hasUserBounds : function() {
      return !!this.__userBounds;
    },


    /**
     * Set user bounds of the widget. Widgets with user bounds are sized and
     * positioned manually and are ignored by any layout manager.
     *
     * @param left {Integer} left position (relative to the parent)
     * @param top {Integer} top position (relative to the parent)
     * @param width {Integer} width of the layout item
     * @param height {Integer} height of the layout item
     */
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


    /**
     * Clear the user bounds. After this call the layout item is laid out by
     * the layout manager again.
     *
     */
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

    /**
     * @type {Map} Empty storage pool
     *
     * @lint ignoreReferenceField(__emptyProperties)
     */
    __emptyProperties : {},


    /**
     * Stores the given layout properties
     *
     * @param props {Map} Incoming layout property data
     */
    setLayoutProperties : function(props)
    {
      if (props == null) {
        return;
      }

      var storage = this.__layoutProperties;
      if (!storage) {
        storage = this.__layoutProperties = {};
      }

      // Check values through parent
      var parent = this.getLayoutParent();
      if (parent) {
        parent.updateLayoutProperties(props);
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
    },


    /**
     * Returns currently stored layout properties
     *
     * @return {Map} Returns a map of layout properties
     */
    getLayoutProperties : function() {
      return this.__layoutProperties || this.__emptyProperties;
    },


    /**
     * Removes all stored layout properties.
     *
     */
    clearLayoutProperties : function() {
      delete this.__layoutProperties;
    },


    /**
     * Should be executed on every change of layout properties.
     *
     * This also includes "virtual" layout properties like margin or align
     * when they have an effect on the parent and not on the widget itself.
     *
     * This method is always executed on the parent not on the
     * modified widget itself.
     *
     * @param props {Map?null} Optional map of known layout properties
     */
    updateLayoutProperties : function(props)
    {
      var layout = this._getLayout();
      if (layout)
      {
        // Verify values through underlying layout
        if (qx.core.Environment.get("qx.debug"))
        {
          if (props)
          {
            for (var key in props) {
              if (props[key] !== null) {
                layout.verifyLayoutProperty(this, key, props[key]);
              }
            }
          }
        }

        // Precomputed and cached children data need to be
        // rebuild on upcoming (re-)layout.
        layout.invalidateChildrenCache();
      }

      qx.ui.core.queue.Layout.add(this);
    },





    /*
    ---------------------------------------------------------------------------
      HIERARCHY SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the application root
     *
     * @return {qx.ui.root.Abstract} The currently used root
     */
    getApplicationRoot : function() {
      return qx.core.Init.getApplication().getRoot();
    },


    /**
     * Get the items parent. Even if the item has been added to a
     * layout, the parent is always a child of the containing item. The parent
     * item may be <code>null</code>.
     *
     * @return {qx.ui.core.Widget|null} The parent.
     */
    getLayoutParent : function() {
      return this.$$parent || null;
    },


    /**
     * Set the parent
     *
     * @param parent {qx.ui.core.Widget|null} The new parent.
     */
    setLayoutParent : function(parent)
    {
      if (this.$$parent === parent) {
        return;
      }

      this.$$parent = parent || null;
      qx.ui.core.queue.Visibility.add(this);
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

        parent = parent.$$parent;
      }

      return null;
    },





    /*
    ---------------------------------------------------------------------------
      CLONE SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    clone : function()
    {
      var clone = this.base(arguments);

      var props = this.__layoutProperties;
      if (props) {
        clone.__layoutProperties = qx.lang.Object.clone(props);
      }

      return clone;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // remove dynamic theme listener
    if (qx.core.Environment.get("qx.dyntheme")) {
      qx.theme.manager.Meta.getInstance().removeListener(
        "changeTheme", this._onChangeTheme, this
      );
    }
    this.$$parent = this.$$subparent = this.__layoutProperties =
      this.__computedLayout = this.__userBounds = this.__sizeHint = null;
  }
});
