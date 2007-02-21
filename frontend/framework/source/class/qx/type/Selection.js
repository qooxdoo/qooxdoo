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
 * Helper for qx.manager.selection.SelectionManager, contains data for selections
 *
 * @param vManager {Object} a class which implements a getItemHashCode(oItem) method
 */
qx.Clazz.define("qx.type.Selection",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vManager)
  {
    qx.core.Object.call(this);

    this._manager = vManager;
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
     * @param oItem {var} item to add
     * @return {void} 
     */
    add : function(oItem) {
      this._storage[this.getItemHashCode(oItem)] = oItem;
    },


    /**
     * Remove an item from the selection
     *
     * @type member
     * @param oItem {var} item to remove
     * @return {void} 
     */
    remove : function(oItem) {
      delete this._storage[this.getItemHashCode(oItem)];
    },


    /**
     * Remove all items from the selection
     *
     * @type member
     * @return {void} 
     */
    removeAll : function() {
      this._storage = {};
    },


    /**
     * Check whether the selection contains a given item
     *
     * @type member
     * @param oItem {var} item to check for
     * @return {Boolean} whether the selection contains the item
     */
    contains : function(oItem) {
      return this.getItemHashCode(oItem) in this._storage;
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

      for (var key in this._storage) {
        res.push(this._storage[key]);
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
      for (var key in this._storage) {
        return this._storage[key];
      }
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

      for (var hc in this._storage) {
        sb.push(hc);
      }

      sb.sort();
      return sb.join(";");
    },


    /**
     * Compute a hash code for an item using the manager
     *
     * @type member
     * @param oItem {var} the item
     * @return {var} unique hash code for the item
     */
    getItemHashCode : function(oItem) {
      return this._manager.getItemHashCode(oItem);
    },


    /**
     * Whether the selection is empty
     *
     * @type member
     * @return {Boolean} whether the selection is empty
     */
    isEmpty : function() {
      return qx.lang.Object.isEmpty(this._storage);
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * Destructor
     *
     * @type member
     * @return {void} 
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      this._storage = null;
      this._manager = null;

      qx.core.Object.prototype.dispose.call(this);
    }
  }
});
