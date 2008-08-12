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
     * @return {LayoutItem[]} The children array (Arrays are
     *   reference types, please to not modify them in-place)
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
     * @param child {Widget} the widget to query for
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
     * @param child {LayoutItem} the widget to add.
     * @param options {Map?null} Optional layout data for widget.
     * @return {void}
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
     * @param child {LayoutItem} Widget to add
     * @param index {Integer} Index, at which the widget will be inserted
     * @param options {Map?null} Optional layout data for widget.
     * @return {void}
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
     * @param child {LayoutItem} Widget to add
     * @param before {LayoutItem} Widget before the new widget will be inserted.
     * @param options {Map?null} Optional layout data for widget.
     * @return {void}
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
     * @param child {LayoutItem} Widget to add
     * @param after {LayoutItem} Widget, after which the new widget will be inserted
     * @param options {Map?null} Optional layout data for widget.
     * @return {void}
     */
    addAfter : function(child, after, options) {
      this._addAfter(child, after, options);
    },


    /**
     * Remove the given child widget.
     *
     * @param child {LayoutItem} the widget to remove
     * @return {void}
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
     * @return {void}
     */
    removeAt : function(index) {
      this._removeAt(index);
    },


    /**
     * Remove all children.
     */
    removeAll : function() {
      this._removeAll();
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
})