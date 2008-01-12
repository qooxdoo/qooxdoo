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
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @return {qx.ui2.layout.Abstract} This object (for chaining support)
     */
    add : function(widget)
    {
      this._children.push(widget);
      this._addToParent(widget);

      // mark layout as invalid
      this.scheduleLayoutUpdate();

      // Chaining support
      return this;
    },


    /**
     * Remove this from the layout
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @return {qx.ui2.layout.Abstract} This object (for chaining support)
     */
    remove : function(widget)
    {
      qx.lang.Array.remove(this._children, widget);
      this._removeFromParent(widget);

      // invalidateLayoutCache the layouts of the widget and its old parent
      widget.scheduleLayoutUpdate();
      this.scheduleLayoutUpdate();

      // Chaining support
      return this;
    },


    /**
     * Whether the widget is a child of this layout
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @return {Boolean} <code>true</code> when the given widget is a child
     *    of this layout.
     */
    has : function(widget) {
      return qx.lang.Array.contains(this._children, widget);
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
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Invalidate all layout relevant caches
     *
     * @internal
     * @abstract
     * @type member
     * @return {void}
     */
    invalidateLayoutCache : function() {
      this.warn("Missing invalidateLayoutCache() implementation!");
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
      parent._contentElement.remove(widget.getElement());
      widget.setParent(null);
    },




    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Imports a list of arguments into the widget layout properties.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param args {arguments} Arguments of original function
     * @return {void}
     */
    _importProperties : function(widget, args)
    {
      var len = Math.min(args.length, arguments.length+1);

      for (var i=1; i<len; i++)
      {
        if (args[i] != null) {
          widget.addLayoutProperty(arguments[i+1], args[i]);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyWidget : function(value, old)
    {
      var children = this.getChildren();
      var length = children.length;

      if (old)
      {
        for (var i=0; i<length; i++)
        {
          this._removeFromParent(children[i]);
          children[i].scheduleLayoutUpdate();
        }
      }

      if (value)
      {
        for (var i=0; i<length; i++)
        {
          this._addToParent(children[i]);
          children[i].scheduleLayoutUpdate();
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
    this._disposeObjectDeep("_children", 1);
  }
});
