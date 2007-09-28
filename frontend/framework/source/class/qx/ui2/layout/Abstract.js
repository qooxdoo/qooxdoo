/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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
    this._children = [];
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
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
     STATICS
  *****************************************************************************
  */

  statics :
  {
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
     * Add this widget to the layout
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @return {void}
     */
    add : function(widget)
    {
      this._children.push(widget);
      this._addToParent(widget);
    },


    /**
     * Remove this from the layout
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @return {void}
     */
    remove : function(widget)
    {
      qx.lang.Array.remove(this._children, widget);
      this._removeFromParent(widget);

      // invalidate the layouts of the widget and its old parent
      widget.invalidateLayout();
      this.invalidateLayout();
    },


    /**
     * Whether the widget is a child of this layout
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @return {void}
     */
    has : function(widget) {
      qx.lang.Array.contains(this._children, widget);
    },


    /**
     * Returns the children list
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @return {void}
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
     * @type member
     * @return {void}
     */
    invalidate : function() {
    },


    /**
     * Indicate that the layout has layout changes and propagate this information
     * up the widget hierarchy.
     *
     * @internal
     */
    invalidateLayout : function()
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
     * @type member
     * @param width {Integer} Final (content) width (in pixel) of the parent widget
     * @param width {Integer} Final (content) height (in pixel) of the parent widget
     * @return {void}
     */
    layout : function(width, height) {
      throw new Error("Missing layout implementation!");
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

    _addToParent : function(widget)
    {
      var parent = this.getWidget();

      if (parent)
      {
        parent._contentElement.add(widget.getElement());
        widget.setParent(parent);
      }
    },

    _removeFromParent : function(widget)
    {
      widget.getElement().free();
      widget.setParent(null);
    },




    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
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
      PROPERTY HANDLER
    ---------------------------------------------------------------------------
    */

    _applyWidget : function(value, old)
    {
      var children = this.getChildren();

      if (old)
      {
        for (var i=0, l=children.length; i<l; i++) {
          this._removeFromParent(children[i]);
        }
      }

      if (value)
      {
        for (var i=0, l=children.length; i<l; i++) {
          this._addToParent(children[i]);
        }
      }
    },


    /**
     * Generic property apply method for all layout relevant properties.
     */
    _applyLayoutChange : function()
    {
      this.invalidateLayout();
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeDeep("_children", 1);


  }
});