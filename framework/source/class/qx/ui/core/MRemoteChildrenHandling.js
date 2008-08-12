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
 * This mixin redirects all children handling methods to a child widget of the
 * including class. This is e.g. used in {@link qx.ui.window.Window} to add
 * child widgets directly to the window pane.
 *
 * The including class must implement the method <code>getChildrenContainer</code>,
 * which has to return the widget, to which the child widgets should be added.
 */
qx.Mixin.define("qx.ui.core.MRemoteChildrenHandling",
{
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the children list
     *
     * @return {LayoutItem[]} The children array (Arrays are
     *   reference types, please to not modify them in-place)
     */
    getChildren : function() {
      return this.getChildrenContainer().getChildren();
    },


    /**
     * Whether the widget contains children.
     *
     * @return {Boolean} Returns <code>true</code> when the widget has children.
     */
    hasChildren : function() {
      return this.getChildrenContainer().hasChildren();
    },


    /**
     * Adds a new child widget.
     *
     * The supported keys of the layout options map depend on the layout manager
     * used to position the widget. The options are documented in the class
     * documentation of each layout manager {@link qx.ui.layout}.
     *
     * @param child {LayoutItem} the item to add.
     * @param options {Map?null} Optional layout data for item.
     * @return {Widget} This object (for chaining support)
     */
    add : function(child, options) {
      return this.getChildrenContainer().add(child, options);
    },


    /**
     * Remove the given child item.
     *
     * @param child {LayoutItem} the item to remove
     * @return {Widget} This object (for chaining support)
     */
    remove : function(child) {
      return this.getChildrenContainer().remove(child);
    },


    /**
     * Remove all children.
     *
     * @return {void}
     */
    removeAll : function() {
      return this.getChildrenContainer().removeAll();
    },


    /**
     * Returns the index position of the given item if it is
     * a child item. Otherwise it returns <code>-1</code>.
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {LayoutItem} the item to query for
     * @return {Integer} The index position or <code>-1</code> when
     *   the given item is no child of this layout.
     */
    indexOf : function(child) {
      return this.getChildrenContainer().indexOf(child);
    },


    /**
     * Add a child at the specified index
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {LayoutItem} item to add
     * @param index {Integer} Index, at which the item will be inserted
     * @param options {Map?null} Optional layout data for item.
     */
    addAt : function(child, index, options) {
      return this.getChildrenContainer().addAt(child, index, options);
    },


    /**
     * Add a item before another already inserted item
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {LayoutItem} item to add
     * @param before {LayoutItem} item before the new item will be inserted.
     * @param options {Map?null} Optional layout data for item.
     */
    addBefore : function(child, before, options) {
      return this.getChildrenContainer().addBefore(child, before, options);
    },


    /**
     * Add a item after another already inserted item
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {LayoutItem} item to add
     * @param after {LayoutItem} item, after which the new item will be inserted
     * @param options {Map?null} Optional layout data for item.
     */
    addAfter : function(child, after, options) {
      return this.getChildrenContainer().addAfter(child, after, options);
    },


    /**
     * Remove the item at the specified index.
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param index {Integer} Index of the item to remove.
     */
    removeAt : function(index) {
      return this.getChildrenContainer().removeAt(index);
    }
  }
});
