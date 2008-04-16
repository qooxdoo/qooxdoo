qx.Class.define("qx.ui.core.Composite",
{
  extend : qx.ui.core.Widget,

  members :
  {
    setLayout : function(layout) {
      this._setLayout(layout);
    },


    /**
     * Returns the children list
     *
     * @type member
     * @return {LayoutItem[]} The children array (Arrays are
     *   reference types, please to not modify them in-place)
     */
    getChildren : function() {
      return this._children;
    },


    /**
     * Adds a new child widget.
     *
     * @type member
     * @param child {LayoutItem} the widget to add.
     * @param options {Map?null} Optional layout data for widget.
     * @return {Widget} This object (for chaining support)
     */
    add : function(child, options) {
      return this._add(child, options);
    },


    /**
     * Remove the given child widget.
     *
     * @type member
     * @param child {LayoutItem} the widget to remove
     * @return {Widget} This object (for chaining support)
     */
    remove : function(child) {
      return this._add(child);
    },


    /**
     * Returns the index position of the given widget if it is
     * a child widget. Otherwise it returns <code>-1</code>.
     *
     * @type member
     * @param child {Widget} the widget to query for
     * @return {Integer} The index position or <code>-1</code> when
     *   the given widget is no child of this layout.
     */
    indexOf : function(child) {
      return this._children.indexOf(child);
    },


    /**
     * Whether the widget contains children.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget has children.
     */
    hasChildren : function() {
      return !!this._children[0];
    },


    /**
     * Add a child widget at the specified index
     *
     * @type member
     * @param child {LayoutItem} widget to add
     * @param index {Integer} Index, at which the widget will be inserted
     */
    _addAt : function(child, index, options) {
      return this._addAt(child, index, options);
    },


    /**
     * Add a widget before another already inserted widget
     *
     * @type member
     * @param child {LayoutItem} widget to add
     * @param before {LayoutItem} widget before the new widget will be inserted.
     * @param index {Integer} Index, at which the widget will be inserted
     */
    _addBefore : function(child, before, options) {
      return this._addBefore(child, before, options);
    },


    /**
     * Add a widget after another already inserted widget
     *
     * @type member
     * @param vChild {LayoutItem} widget to add
     * @param after {LayoutItem} widgert, after which the new widget will be inserted
     * @param index {Integer} Index, at which the widget will be inserted
     */
    _addAfter : function(child, after, options) {
      return this._addAfter(child, after, options);
    },


    /**
     * Remove the widget at the specified index.
     *
     * @type member
     * @param index {Integer} Index of the widget to remove.
     */
    _removeAt : function(index) {
      return this._removeAt(index);
    },


    /**
     * Remove all children.
     *
     * @type member
     */
    _removeAll : function() {
      return this._removeAll();
    }
  }
})