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
 * This mixin exposes all basic methods to manage widget children as public methods.
 * It can only be included into instances of {@link Widget}.
 *
 * To optimize the method calls the including widget should call the method
 * {@link #remap} in its defer function. This will map the protected
 * methods to the public ones and save one method call for each function.
 */
qx.Mixin.define("qx.ui.core.MChildrenHandling",
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
     * @return {qx.ui.core.LayoutItem[]} The children array (Arrays are
     *   reference types, please do not modify them in-place)
     */
    getChildren : function() {
      return this._getChildren();
    },


    /**
     * Whether the widget contains children.
     *
     * @return {Boolean} Returns <code>true</code> when the widget has children.
     */
    hasChildren : function() {
      return this._hasChildren();
    },


    /**
     * Returns the index position of the given widget if it is
     * a child widget. Otherwise it returns <code>-1</code>.
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {qx.ui.core.Widget} the widget to query for
     * @return {Integer} The index position or <code>-1</code> when
     *   the given widget is no child of this layout.
     */
    indexOf : function(child) {
      return this._indexOf(child);
    },


    /**
     * Adds a new child widget.
     *
     * The supported keys of the layout options map depend on the layout manager
     * used to position the widget. The options are documented in the class
     * documentation of each layout manager {@link qx.ui.layout}.
     *
     * @param child {qx.ui.core.LayoutItem} the widget to add.
     * @param options {Map?null} Optional layout data for widget.
     */
    add : function(child, options) {
      this._add(child, options);
    },


    /**
     * Add a child widget at the specified index
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {qx.ui.core.LayoutItem} Widget to add
     * @param index {Integer} Index, at which the widget will be inserted
     * @param options {Map?null} Optional layout data for widget.
     */
    addAt : function(child, index, options) {
      this._addAt(child, index, options);
    },


    /**
     * Add a widget before another already inserted widget
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {qx.ui.core.LayoutItem} Widget to add
     * @param before {qx.ui.core.LayoutItem} Widget before the new widget will be inserted.
     * @param options {Map?null} Optional layout data for widget.
     */
    addBefore : function(child, before, options) {
      this._addBefore(child, before, options);
    },


    /**
     * Add a widget after another already inserted widget
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param child {qx.ui.core.LayoutItem} Widget to add
     * @param after {qx.ui.core.LayoutItem} Widget, after which the new widget will be inserted
     * @param options {Map?null} Optional layout data for widget.
     */
    addAfter : function(child, after, options) {
      this._addAfter(child, after, options);
    },


    /**
     * Remove the given child widget.
     *
     * @param child {qx.ui.core.LayoutItem} the widget to remove
     */
    remove : function(child) {
      this._remove(child);
    },


    /**
     * Remove the widget at the specified index.
     *
     * This method works on the widget's children list. Some layout managers
     * (e.g. {@link qx.ui.layout.HBox}) use the children order as additional
     * layout information. Other layout manager (e.g. {@link qx.ui.layout.Grid})
     * ignore the children order for the layout process.
     *
     * @param index {Integer} Index of the widget to remove.
     * @return {qx.ui.core.LayoutItem} The child removed.
     */
    removeAt : function(index) {
      return this._removeAt(index);
    },


    /**
     * Remove all children.
     *
     * @return {Array} An array of the removed children.
     */
    removeAll : function() {
      return this._removeAll();
    }
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Mapping of protected methods to public.
     * This omits an additional function call when using these methods. Call
     * this methods in the defer block of the including class.
     *
     * @param members {Map} The including classes members map
     */
    remap : function(members)
    {
      members.getChildren = members._getChildren;
      members.hasChildren = members._hasChildren;
      members.indexOf = members._indexOf;

      members.add = members._add;
      members.addAt = members._addAt;
      members.addBefore = members._addBefore;
      members.addAfter = members._addAfter;

      members.remove = members._remove;
      members.removeAt = members._removeAt;
      members.removeAll = members._removeAll;
    }
  }
});
