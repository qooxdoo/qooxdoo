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

    // Contains layout options of widgets (always index identical to the children array)
    this._options = [];
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
      CHILDREN HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a new widget to this layout.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} the widget to add.
     * @param layout {Map?null} Optional layout data for widget.
     * @return {qx.ui2.layout.Abstract} This object (for chaining support)
     */
    add : function(child, layout)
    {
      this._children.push(child);
      this._options.push(layout || {});

      this._addToParent(child);

      // mark layout as invalid
      this.scheduleLayoutUpdate();

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
      var index = this._children.indexOf(child);
      qx.lang.Array.removeAt(this._children, index);
      qx.lang.Array.removeAt(this._options, index);

      this._removeFromParent(child);

      // Invalidate layout cache of the layouts of the widget and its old parent
      child.scheduleLayoutUpdate();
      this.scheduleLayoutUpdate();

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
      var index = this.indexOf(child);
      this._options[index][name] = value;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (index === -1)
        {
          this.trace();
          throw new Error("Layout properties can only configured on widgets which are children of this layout.");
        }
      }

      this.scheduleLayoutUpdate();
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
      var index = this.indexOf(child);

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (index === -1)
        {
          this.trace();
          throw new Error("Layout properties can only configured on widgets which are children of this layout.");
        }
      }

      delete this._options[index][name];

      this.scheduleLayoutUpdate();
    },


    /**
     * Returns the value of a specific property of the given widget.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} Widget to query
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @return {var|null} Configured value
     */
    getLayoutProperty : function(child, name)
    {
      var index = this.indexOf(child);

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (index === -1)
        {
          this.trace();
          throw new Error("Layout properties can only configured on widgets which are children of this layout.");
        }
      }

      var value = this._options[index][name];
      return value == null ? null : value;
    },


    /**
     * Whether the given widget has a specific property.
     *
     * @type member
     * @param child {qx.ui2.core.Widget} Widget to query
     * @param name {String} Name of the hint (width, top, minHeight, ...)
     * @return {Boolean} <code>true</code> when this hint is defined
     */
    hasLayoutProperty : function(child, name)
    {
      var index = this.indexOf(child);

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (index === -1)
        {
          this.trace();
          throw new Error("Layout properties can only configured on widgets which are children of this layout.");
        }
      }

      return this._options[index][name] != null;
    },






    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Invalidate all layout relevant caches
     *
     * @internal
     * @type member
     * @return {void}
     */
    invalidateLayoutCache : function() {
      return;
    },


    /**
     * Indicate that the layout has layout changes and propagate this information
     * up the widget hierarchy.
     *
     * @internal
     * @type member
     * @return {void}
     */
    scheduleLayoutUpdate : function()
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
     * @internal
     * @type member
     * @return {Map|null} The map with the preferred width/height and the allowed
     *   minimum and maximum values in cases where shrinking or growing
     *   is required. Can also return <code>null</code> when this detection
     *   is not supported by the layout.
     */
    getSizeHint : function() {
      return null;
    },





    /*
    ---------------------------------------------------------------------------
      PARENT UTILS
    ---------------------------------------------------------------------------
    */

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
          child.scheduleLayoutUpdate();
        }
      }

      if (value)
      {
        for (var i=0; i<length; i++)
        {
          child = children[i];

          this._addToParent(child);
          child.scheduleLayoutUpdate();
        }
      }
    },


    /**
     * Generic property apply method for all layout relevant properties.
     */
    _applyLayoutChange : function() {
      this.scheduleLayoutUpdate();
    }
  },





  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjectDeep("_children", 2);
  }
});
