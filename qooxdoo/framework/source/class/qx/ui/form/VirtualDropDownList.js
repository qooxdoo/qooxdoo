/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.ui.form.VirtualDropDownList",
{
  extend  : qx.ui.popup.Popup,


  construct : function(target)
  {
    qx.core.Assert.assertNotNull(target, "Invalid parameter 'target'!");
    qx.core.Assert.assertNotUndefined(target, "Invalid parameter 'target'!");
    qx.core.Assert.assertInterface(target, qx.ui.form.AbstractVirtualPopupList, "Invalid parameter 'target'!");

    this.base(arguments, new qx.ui.layout.VBox());

    this._target = target;

    this._createChildControl("list");

    this.initSelection(new qx.data.Array());
  },


  properties :
  {
    // overridden
    autoHide :
    {
      refine : true,
      init : false
    },

    // overridden
    keepActive :
    {
      refine : true,
      init : true
    },


    /** Current selected items */
    selection :
    {
      check : "qx.data.Array",
      event : "changeSelection",
      apply : "_applySelection",
      nullable : false,
      deferredInit : true
    }
  },


  members :
  {
    _target : null,


    _preselected : null,


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "list":
          control = new qx.ui.list.List().set({
            focusable: false,
            keepFocus: true,
            height: null,
            width: null,
            maxHeight: this._target.getMaxListHeight(),
            selectionMode: "one",
            quickSelection: true
          });

          this.add(control, {flex: 1});
          break;
      }

      return control || this.base(arguments, id);
    },



    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Shows the list popup.
     */
    open : function()
    {
      this.placeToWidget(this._target, true);
      this.show();
    },


    /**
     * Hides the list popup.
     */
    close : function() {
      this.hide();
    },


    /**
     * Toggles the popup's visibility.
     */
    toggle : function()
    {
      if (this.isVisible()) {
        this.close();
      } else {
        this.open();
      }
    },


    selectFirst : function()
    {
      console.log("selectFirst")
    },


    selectLast : function()
    {
      console.log("selectLast")
    },


    selectPrevious : function()
    {
      console.log("selectPrevious")
    },


    selectNext : function()
    {
      console.log("selectNext")
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelection : function(value, old) {
      this.getChildControl("list").setSelection(value);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    _handleKeyboard : function(event)
    {
      var clone = event.clone();
      clone.setTarget(this.getChildControl("list"));
      clone.setBubbles(false);

      console.log("on list")
      this.getChildControl("list").dispatchEvent(clone);
    },


    _handleMouse : function(event)
    {
    }
  },


  destruct : function()
  {
  }
});
