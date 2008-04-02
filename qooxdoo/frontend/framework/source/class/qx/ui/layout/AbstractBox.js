qx.Class.define("qx.ui.layout.AbstractBox",
{
  extend : qx.ui.layout.Abstract,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Spacing between two children */
    spacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },


    /** Whether the actual children data should be reversed for layout */
    reversed :
    {
      check : "Boolean",
      init : false,
      apply : "_applyLayoutChange"
    }
  },


  members :
  {
    /**
     * Add a spacer at the current position to the layout. The spacer has a flex
     * value of one and will stretch to the available space.
     *
     * @return {qx.ui.core.Spacer} The newly added spacer object. A reference
     *   to the spacer is needed to remove ths spacer from the layout.
     */
    addSpacer : function()
    {
      var spacer = new qx.ui.core.Spacer(0, 0);
      this.add(spacer, {flex: 1});
      return spacer;
    },


    /**
     * Get the index of a child widget.
     *
     * @type member
     * @param vChild {qx.ui.core.LayoutItem} Child widget to get the index for
     * @return {Integer} index of the child widget
     */
    indexOf : function(vChild) {
      return this._children.indexOf(vChild);
    },


    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: ADD
    ---------------------------------------------------------------------------
    */

    /**
     * Add a child widget at the specified index
     *
     * @type member
     * @param child {qx.ui.core.LayoutItem} widget to add
     * @param index {Integer} Index, at which the widget will be inserted
     */
    addAt : function(child, index, options)
    {
      var children = this._children;

      if (index == null || index < 0 || index > children.length) {
        throw new Error("Not a valid index for addAt(): " + vIndex);
      }

      qx.lang.Array.insertAt(children, child, index);
      this._addHelper(child, options);

      return index;
    },


    /**
     * Add a child widget as the first widget
     *
     * @type member
     * @param child {qx.ui.core.LayoutItem} widget to add
     */
    addAtBegin : function(child, options) {
      return this.addAt(child, 0, options);
    },


    /**
     * Add a widget before another already inserted widget
     *
     * @type member
     * @param child {qx.ui.core.LayoutItem} widget to add
     * @param before {qx.ui.core.LayoutItem} widget before the new widget will be inserted.
     * @param index {Integer} Index, at which the widget will be inserted
     */
    addBefore : function(child, before, options)
    {
      var targetIndex = this.indexOf(before);

      if (targetIndex == -1) {
        throw new Error("Child to add before: " + before + " is not inside this layout.");
      }

      var sourceIndex = this.indexOf(child);

      if (sourceIndex == -1 || sourceIndex > targetIndex) {
        targetIndex++;
      }

      return this.addAt(child, Math.max(0, targetIndex - 1), options);
    },


    /**
     * Add a widget after another already inserted widget
     *
     * @type member
     * @param vChild {qx.ui.core.LayoutItem} widget to add
     * @param after {qx.ui.core.LayoutItem} widgert, after which the new widget will be inserted
     * @param index {Integer} Index, at which the widget will be inserted
     */
    addAfter : function(child, after, options)
    {
      var targetIndex = this.indexOf(after);

      if (targetIndex == -1) {
        throw new Error("Child to add after: " + after + " is not inside this parent.");
      }

      var sourceIndex = this.indexOf(child);

      if (sourceIndex != -1 && sourceIndex < targetIndex) {
        targetIndex--;
      }

      return this.addAt(child, Math.min(this._children.length, targetIndex + 1), options);
    },


    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT: REMOVE
    ---------------------------------------------------------------------------
    */
    /**
     * Remove the widget at the specified index.
     *
     * @type member
     * @param index {Integer} Index of the widget to remove.
     */
    removeAt : function(index)
    {
      var child = this._children[index];

      if (child) {
        this.remove(child)
      }
    },


    /**
     * Remove all children.
     *
     * @type member
     */
    removeAll : function()
    {
      var children = this._children;

      for (var i = children.length-1; i>=0; i--)
      {
        var widget = children[i];
        this.remove(widget);
      }
    }
  }
});