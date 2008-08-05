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
 * Each instance manages vItems set of radio options: qx.legacy.ui.form.RadioButton, qx.legacy.ui.toolbar.RadioButton, ...
 */
qx.Class.define("qx.legacy.ui.selection.RadioManager",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vName, vMembers)
  {
    // we don't need the manager data structures
    this.base(arguments);

    // create item array
    this._items = [];

    // apply name property
    this.setName(vName != null ? vName : qx.legacy.ui.selection.RadioManager.AUTO_NAME_PREFIX + this.toHashCode());

    if (vMembers != null)
    {
      // add() iterates over arguments, but vMembers is an array
      this.add.apply(this, vMembers);
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics : {
    AUTO_NAME_PREFIX : "qx-radio-"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    selected :
    {
      nullable : true,
      apply : "_applySelected",
      event : "changeSelected",
      check : "qx.core.Object"
    },

    name :
    {
      check : "String",
      nullable : true,
      apply : "_applyName"
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
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getItems : function() {
      return this._items;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getEnabledItems : function()
    {
      var b = [];

      for (var i=0, a=this._items, l=a.length; i<l; i++)
      {
        if (a[i].getEnabled()) {
          b.push(a[i]);
        }
      }

      return b;
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @param vChecked {var} TODOC
     * @return {void}
     */
    handleItemChecked : function(vItem, vChecked)
    {
      if (vChecked) {
        this.setSelected(vItem);
      } else if (this.getSelected() == vItem) {
        this.setSelected(null);
      }
    },




    /*
    ---------------------------------------------------------------------------
      REGISTRY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param varargs {var} TODOC
     * @return {void}
     */
    add : function(varargs)
    {
      var vItems = arguments;
      var vLength = vItems.length;
      var vItem;

      for (var i=0; i<vLength; i++)
      {
        vItem = vItems[i];

        if (qx.lang.Array.contains(this._items, vItem)) {
          return;
        }

        // Push RadioButton to array
        this._items.push(vItem);

        // Inform radio button about new manager
        vItem.setManager(this);

        // Need to update internal value?
        if (vItem.getChecked()) {
          this.setSelected(vItem);
        }

        // Apply Make name the same
        vItem.setName(this.getName());
      }
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {void}
     */
    remove : function(vItem)
    {
      // Remove RadioButton from array
      qx.lang.Array.remove(this._items, vItem);

      // Inform radio button about new manager
      vItem.setManager(null);

      // if the radio was checked, set internal selection to null
      if (vItem.getChecked()) {
        this.setSelected(null);
      }
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySelected : function(value, old)
    {
      if (old) {
        old.setChecked(false);
      }

      if (value) {
        value.setChecked(true);
      }
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyName : function(value, old)
    {
      for (var i=0, vItems=this._items, vLength=vItems.length; i<vLength; i++) {
        vItems[i].setName(value);
      }
    },




    /*
    ---------------------------------------------------------------------------
      SELECTION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {void}
     */
    selectNext : function(vItem)
    {
      var vIndex = this._items.indexOf(vItem);

      if (vIndex == -1) {
        return;
      }

      var i = 0;
      var vLength = this._items.length;

      // Find next enabled item
      vIndex = (vIndex + 1) % vLength;

      while (i < vLength && !this._items[vIndex].getEnabled())
      {
        vIndex = (vIndex + 1) % vLength;
        i++;
      }

      this._selectByIndex(vIndex);
    },


    /**
     * TODOC
     *
     * @param vItem {var} TODOC
     * @return {void}
     */
    selectPrevious : function(vItem)
    {
      var vIndex = this._items.indexOf(vItem);

      if (vIndex == -1) {
        return;
      }

      var i = 0;
      var vLength = this._items.length;

      // Find previous enabled item
      vIndex = (vIndex - 1 + vLength) % vLength;

      while (i < vLength && !this._items[vIndex].getEnabled())
      {
        vIndex = (vIndex - 1 + vLength) % vLength;
        i++;
      }

      this._selectByIndex(vIndex);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {void}
     */
    _selectByIndex : function(vIndex)
    {
      if (this._items[vIndex].getEnabled())
      {
        this.setSelected(this._items[vIndex]);
        this._items[vIndex].setFocused(true);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeArray("_items");
  }
});
