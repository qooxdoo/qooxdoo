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
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************



************************************************************************ */

/**
 * Helper for qx.ui.selection.SelectionManager, contains data for selections
 */
qx.Class.define("qx.ui.selection.Selection",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param mgr {Object} a class which implements a getItemHashCode(item) method
   */
  construct : function(mgr)
  {
    this.base(arguments);

    this.__manager = mgr;
    this.removeAll();
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
      USER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Add an item to the selection
     *
     * @type member
     * @param item {var} item to add
     * @return {void}
     */
    add : function(item) {
      this.__storage[this.getItemHashCode(item)] = item;
    },


    /**
     * Remove an item from the selection
     *
     * @type member
     * @param item {var} item to remove
     * @return {void}
     */
    remove : function(item) {
      delete this.__storage[this.getItemHashCode(item)];
    },


    /**
     * Remove all items from the selection
     *
     * @type member
     * @return {void}
     */
    removeAll : function() {
      this.__storage = {};
    },


    /**
     * Check whether the selection contains a given item
     *
     * @type member
     * @param item {var} item to check for
     * @return {Boolean} whether the selection contains the item
     */
    contains : function(item) {
      return this.getItemHashCode(item) in this.__storage;
    },


    /**
     * Convert selection to an array
     *
     * @type member
     * @return {Array} array representation of the selection
     */
    toArray : function()
    {
      var res = [];

      for (var key in this.__storage) {
        res.push(this.__storage[key]);
      }

      return res;
    },


    /**
     * Return first element of the Selection
     *
     * @type member
     * @return {var} first item of the selection
     */
    getFirst : function()
    {
      for (var key in this.__storage) {
        return this.__storage[key];
      }
      return null;
    },


    /**
     * Get a string representation of the Selection. The return value can be used to compare selections.
     *
     * @type member
     * @return {String} string representation of the Selection
     */
    getChangeValue : function()
    {
      var sb = [];

      for (var key in this.__storage) {
        sb.push(key);
      }

      sb.sort();
      return sb.join(";");
    },


    /**
     * Compute a hash code for an item using the manager
     *
     * @type member
     * @param item {var} the item
     * @return {var} unique hash code for the item
     */
    getItemHashCode : function(item) {
      return this.__manager.getItemHashCode(item);
    },


    /**
     * Whether the selection is empty
     *
     * @type member
     * @return {Boolean} whether the selection is empty
     */
    isEmpty : function() {
      return qx.lang.Object.isEmpty(this.__storage);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__storage", "__manager");
  }
});
