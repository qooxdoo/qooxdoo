/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * This mixin exposes all basic methods to manage widget children as public methods.
 * It can only be included into instances of {@link Widget}.
 *
 * To optimize the method calls the including widget should call the method
 * {@link #remap} in its defer function. This will map the protected
 * methods to the public ones and save one method call for each function.
 */
qx.Mixin.define("qx.ui.mobile.core.MChildrenHandling", {
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * Returns the children list
     *
     * @return {qx.ui.core.Widget[]} The children array (Arrays are
     *   reference types, please do not modify them in-place)
     */
    getChildren() {
      return this._getChildren();
    },

    /**
     * Whether the widget contains children.
     *
     * @return {Boolean} Returns <code>true</code> when the widget has children.
     */
    hasChildren() {
      return this._hasChildren();
    },

    /**
     * Returns the index position of the given widget if it is
     * a child widget. Otherwise it returns <code>-1</code>.
     *
     * @param child {qx.ui.core.Widget} the widget to query for
     * @return {Integer} The index position or <code>-1</code> when
     *   the given widget is no child of this layout.
     */
    indexOf(child) {
      return this._indexOf(child);
    },

    /**
     * Adds a new child widget.
     *
     * @param child {qx.ui.core.Widget} the widget to add.
     * @param layoutProperties {Map?null} Optional layout data for widget.
     */
    add(child, layoutProperties) {
      this._add(child, layoutProperties);
    },

    /**
     * Add a child widget at the specified index
     *
     * @param child {qx.ui.core.Widget} widget to add
     * @param index {Integer} Index, at which the widget will be inserted
     * @param options {Map?null} Optional layout data for widget.
     */
    addAt(child, index, options) {
      this._addAt(child, index, options);
    },

    /**
     * Add a widget before another already inserted widget
     *
     * @param child {qx.ui.core.Widget} Widget to add
     * @param before {qx.ui.core.Widget} Widget before the new widget will be inserted.
     * @param layoutProperties {Map?null} Optional layout data for widget.
     */
    addBefore(child, before, layoutProperties) {
      this._addBefore(child, before, layoutProperties);
    },

    /**
     * Add a widget after another already inserted widget
     *
     * @param child {qx.ui.core.Widget} Widget to add
     * @param after {qx.ui.core.Widget} Widget, after which the new widget will be inserted
     * @param layoutProperties {Map?null} Optional layout data for widget.
     */
    addAfter(child, after, layoutProperties) {
      this._addAfter(child, after, layoutProperties);
    },

    /**
     * Remove the given child widget.
     *
     * @param child {qx.ui.core.Widget} the widget to remove
     */
    remove(child) {
      this._remove(child);
    },

    /**
     * Remove the widget at the specified index.
     *
     * @param index {Integer} Index of the widget to remove.
     */
    removeAt(index) {
      this._removeAt(index);
    },

    /**
     * Remove all children.
     */
    removeAll() {
      this._removeAll();
    }
  },

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics: {
    /**
     * Mapping of protected methods to public.
     * This omits an additional function call when using these methods. Call
     * this methods in the defer block of the including class.
     *
     * @param members {Map} The including classes members map
     */
    remap(members) {
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
