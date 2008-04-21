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

qx.Class.define("qx.ui.container.Composite",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param layout {qx.ui.layout.Abstract} A layout instance to use to
   *   place widgets on the screen.
   */
  construct : function(layout)
  {
    this.base(arguments);

    if (layout != null) {
      this._setLayout(layout);
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
      LAYOUT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Set a layout manager for the widget. A a layout manager can only be connected
     * with one widget. Reset the connection with a previous widget first, if you
     * like to use it in another widget instead.
     *
     * @type member
     * @param layout {qx.ui.layout.Abstract} The new layout or
     *     <code>null</code> to reset the layout.
     * @return {void}
     */
    setLayout : function(layout) {
      return this._setLayout(layout);
    },





    /*
    ---------------------------------------------------------------------------
      CHILDREN LIST MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the children list
     *
     * @type member
     * @return {LayoutItem[]} The children array (Arrays are
     *   reference types, please to not modify them in-place)
     */
    getChildren : function() {
      return this._getChildren();
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
      return this._indexOf(child);
    },


    /**
     * Whether the widget contains children.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the widget has children.
     */
    hasChildren : function() {
      return this._hasChildren();
    },




    /*
    ---------------------------------------------------------------------------
      ADD CHILDREN
    ---------------------------------------------------------------------------
    */

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
     * Add a child widget at the specified index
     *
     * @type member
     * @param child {LayoutItem} widget to add
     * @param index {Integer} Index, at which the widget will be inserted
     */
    addAt : function(child, index, options) {
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
    addBefore : function(child, before, options) {
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
    addAfter : function(child, after, options) {
      return this._addAfter(child, after, options);
    },





    /*
    ---------------------------------------------------------------------------
      REMOVE CHILDREN
    ---------------------------------------------------------------------------
    */

    /**
     * Remove the given child widget.
     *
     * @type member
     * @param child {LayoutItem} the widget to remove
     * @return {Widget} This object (for chaining support)
     */
    remove : function(child) {
      return this._remove(child);
    },


    /**
     * Remove the widget at the specified index.
     *
     * @type member
     * @param index {Integer} Index of the widget to remove.
     */
    removeAt : function(index) {
      return this._removeAt(index);
    },


    /**
     * Remove all children.
     *
     * @type member
     */
    removeAll : function() {
      return this._removeAll();
    }
  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    // Mapping of protected methods to public.
    // This omits an additional function call when using these methods.

    members.setLayout = members._setLayout;

    members.getChildren = members._getChildren;
    members.indexOf = members._indexOf;
    members.hasChildren = members._hasChildren;

    members.add = members._add;
    members.addAt = members._addAt;
    members.addBefore = members._addBefore;
    members.addAfter = members._addAfter;

    members.remove = members._remove;
    members.removeAt = members._removeAt;
    members.removeAll = members._removeAll;
  }
})