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
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Stores selection information.
 */
qx.Class.define("qx.ui.core.selection.Storage",
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

    this.__storage = {};
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Add an item to the selection
     *
     * @type member
     * @param item {var} item to add
     * @return {void}
     */
    add : function(item) {
      this.__storage[item.$$hash] = item;
    },


    /**
     * Remove an item from the selection
     *
     * @type member
     * @param item {var} item to remove
     * @return {void}
     */
    remove : function(item) {
      delete this.__storage[item.$$hash];
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
      return !!this.__storage[item.$$hash];
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
      var storage = this.__storage;

      for (var hash in storage) {
        res.push(storage[hash]);
      }

      return res;
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
    this._disposeFields("__storage");
  }
});
