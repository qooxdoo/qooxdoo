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
qx.Class.define("qx.ui2.layout.Abstract",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // This array contains the children (instances of Widget)
    this._children = [];

    // Contains layout options of widgets (the key is the hashcode of the widget)
    this._options = {};
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Stores the connected widget instance. Each layout instance can only
     * be used by one widget and this is the place this relation is stored.
     */
    widget :
    {
      check : "qx.ui2.core.Widget",
      init : null,
      nullable : true,
      apply : "_applyWidget"
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
      CHILDREN HANDLING - PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a new widget to this layout.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} the widget to add.
     * @param options {Map?null} Optional layout data for widget.
     * @return {qx.ui2.layout.Abstract} This object (for chaining support)
     */
    add : function(child, options)
    {
      this._children.push(child);
      this._addHelper(child, options);

      // Chaining support
      return this;
    },


    /**
     * Remove this from the layout
     *
     * @type member
     * @param child {qx.ui2.core.Widget} the widget to add
     * @return {qx.ui2.layout.Abstract} This object (for chaining support)
     */
    remove : function(child)
    {
      qx.lang.Array.remove(this._children, child);
      this._removeHelper(child);

      // Chaining support
      return this;
    },


    /**
     * Returns the index position of the given widget if it is
     * a member of this layout. Otherwise it returns <code>-1</code>.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} the widget to query for
     * @return {Integer} The index position or <code>-1</code> when
     *   the given widget is no child of this layout.
     */
    indexOf : function(child) {
      return this._children.indexOf(child);
    },


    /**
     * Whether the widget is a child of this layout
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @return {Boolean} <code>true</code> when the given widget is a child
     *    of this layout.
     */
    contains : function(child) {
      return this._children.indexOf(child) !== -1;
    },


    /**
     * Returns the children list
     *
     * @type member
     * @return {qx.ui2.core.Widget[]} The children array (Arrays are
     *   reference types, please to not modify them in-place)
     */
    getChildren : function() {
      return this._children;
    },


    /**
     * Returns all children, which are layout relevant. This excludes all widgets,
     * which have a {@link qx.ui2.core.Widget#visibility} value of <code>exclude</code>.
     *
     * @return {qx.ui2.core.Widget[]} All layout relevant children.
     */
    getLayoutChildren : function()
    {
      var layoutChildren = [];

      for (var i=0, l=this._children.length; i<l; i++)
      {
        var child = this._children[i];
        if (child.getVisibility() !== "exclude") {
          layoutChildren.push(child);
        }
      }
      return layoutChildren;
    },


    /**
     * Whether the layout contains children.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the layout has children.
     */
    hasChildren : function() {
      return !!this._children[0];
    },






    /*
    ---------------------------------------------------------------------------
      CHILDREN HANDLING - IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    _addHelper : function(child, layout)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!child || !(child instanceof qx.ui2.core.Widget)) {
          throw new Error("Invalid widget to add: " + child);
        }

        if (layout != null && typeof layout !== "object") {
          throw new Error("Invalid layout data: " + layout);
        }
      }

      this._options[child.toHashCode()] = layout || {};
      this._addToParent(child);

      // Invalidate layout cache
      this.scheduleWidgetLayoutUpdate();
    },


    _removeHelper : function(child)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!child || !(child instanceof qx.ui2.core.Widget)) {
          throw new Error("Invalid widget to remove: " + child);
        }
      }

      delete this._options[child.toHashCode()];
      this._removeFromParent(child);

      // Invalidate layout cache
      this.scheduleWidgetLayoutUpdate();
    },


    /**
     * Helper to manage child insertion.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to insert
     * @return {void}
     */
    _addToParent : function(widget)
    {
      var parent = this.getWidget();

      if (parent)
      {
        parent._contentElement.add(widget.getElement());
        widget.setParent(parent);
      }
    },


    /**
     * Helper to manage child removal.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to remove
     * @return {void}
     */
    _removeFromParent : function(widget)
    {
      var parent = this.getWidget();

      if (parent) {
        parent._contentElement.remove(widget.getElement());
      }

      widget.setParent(null);
    },






    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES
    ---------------------------------------------------------------------------
      These are used to manage the additonal layout data of a child used by
      the parent layout manager.
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a layout property to the given widget.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} Widget to configure
     * @param name {String} Name of the property (width, top, minHeight, ...)
     * @param value {var} Any acceptable value (depends on the selected parent layout manager)
     * @return {qx.ui2.core.Widget} This widget (for chaining support)
     */
    addLayoutProperty : function(child, name, value)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        switch(typeof value)
        {
          case "string":
          case "number":
          case "boolean":
            break;

          default:
            throw new Error("Invalid value for layout property " + name + ": " + value);
        }
      }

      this._options[child.toHashCode()][name] = value;
      this.scheduleWidgetLayoutUpdate();
    },


    /**
     * Removes a layout property from the given widget.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} Widget to configure
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @return {qx.ui2.core.Widget} This widget (for chaining support)
     */
    removeLayoutProperty : function(child, name)
    {
      delete this._options[child.toHashCode()][name];
      this.scheduleWidgetLayoutUpdate();
    },


    /**
     * Returns the value of a specific property of the given widget.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} Widget to query
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @param def {var?} Any value which should be returned as a default
     * @return {var|null} Configured value
     */
    getLayoutProperty : function(child, name, def)
    {
      var value = this._options[child.toHashCode()][name];

      if (value == null)
      {
        if (def != null) {
          return def;
        }

        return null;
      }

      return value;
    },


    /**
     * Returns all layout properties of a child widget as a map.
     *
     * @param child {qx.ui2.core.Widget} Widget to query
     * @return {Map} a map of all layout properties.
     */
    getLayoutProperties : function(child) {
      return this._options[child.toHashCode()] || {};
    },


    /**
     * Whether the given widget has a specific property.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} Widget to query
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @return {Boolean} <code>true</code> when this hint is defined
     */
    hasLayoutProperty : function(child, name) {
      return this._options[child.toHashCode()][name] != null;
    },






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
     * Indicate that the layout has layout changes and propagate this information
     * up the widget hierarchy.
     *
     * @type member
     * @return {void}
     */
    scheduleWidgetLayoutUpdate : function()
    {
      var widget = this.getWidget();
      if (widget) {
        qx.ui2.core.LayoutQueue.add(widget);
      }
    },


    /**
     * Applies the children layout.
     *
     * @internal
     * @abstract
     * @type member
     * @param width {Integer} Final (content) width (in pixel) of the parent widget
     * @param height {Integer} Final (content) height (in pixel) of the parent widget
     * @return {void}
     */
    renderLayout : function(width, height) {
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
        this.debug("Cached size hint: ", this._sizeHint);
        return this._sizeHint;

      }

      if (this._computeSizeHint)
      {
        this._sizeHint = this._computeSizeHint();
        this.debug("Computed size hint: ", this._sizeHint);
      }

      return this._sizeHint || null;
    },


    /**
     * If one of the layout'S children changes its visibility from or to the
     * value <code>exclude</code> the layout is infomed about this event using
     * this function.
     *
     * Concrete layout implementations may override this function.
     *
     * @param child {qx.ui2.core.Widget} The changed widget
     * @param visibility {String} The widget's new visibility value
     */
    changeChildVisibility : function(child, visibility) {
      // empty implementation
    },


    /**
     * This computes the size hint of the layout and returns it.
     *
     * @abstract
     * @type member
     * @return {Map|null} The size hint or <code>null</code> when the size hint is not supported.
     */
    _computeSizeHint : function() {
      return null;
    },





    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyWidget : function(value, old)
    {
      var children = this._children;
      var length = children.length;
      var child;

      if (old)
      {
        for (var i=0; i<length; i++)
        {
          child = children[i];
          this._removeFromParent(child);
        }

        old.scheduleLayoutUpdate();
      }

      if (value)
      {
        for (var i=0; i<length; i++)
        {
          child = children[i];
          this._addToParent(child);
        }

        value.scheduleLayoutUpdate();
      }
    },


    /**
     * Generic property apply method for all layout relevant properties.
     */
    _applyLayoutChange : function() {
      this.scheduleWidgetLayoutUpdate();
    }
  },





  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjectDeep("_children", 1);
    this._disposeFields("_options");
  }
});
