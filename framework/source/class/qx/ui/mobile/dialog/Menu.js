/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * This widget displays a menu. A dialog menu extends a dialog and contains a
 * list, which provides the user the possibility to select one value.
 * The selected value is identified through selected index.
 *
 *
 *
 * *Example*
 * <pre class='javascript'>
 *
 * var model = new qx.data.Array(["item1","item2","item3"]);
 *
 * var menu = new qx.ui.mobile.dialog.Menu(model);
 * menu.show();
 * menu.addListener("changeSelection", function(evt){
 *    var selectedIndex = evt.getData().index;
 *    var selectedItem = evt.getData().item;
 * }, this);
 * </pre>
 *
 * This example creates a menu with several choosable items.
 */
qx.Class.define("qx.ui.mobile.dialog.Menu",
{
  extend : qx.ui.mobile.dialog.Dialog,

  /**
   * @param itemsModel {qx.data.Array ?}, the model which contains the choosable items of the menu.
   * @param anchor {qx.ui.mobile.core.Widget ?} The anchor widget for this item. If no anchor is available, the menu will be displayed modal and centered on screen.
   */
  construct : function(itemsModel, anchor)
  {
    // Create the list with a delegate that
    // configures the list item.
    this.__selectionList = this._createSelectionList();

    if(itemsModel) {
      this.__selectionList.setModel(itemsModel);
    }

    var menuContainer = new qx.ui.mobile.container.Composite();
    var clearButton = this.__clearButton = new qx.ui.mobile.form.Button(this.getClearButtonLabel());
    clearButton.addListener("tap", this.__onClearButtonTap, this);
    clearButton.setVisibility("excluded");

    menuContainer.add(this.__selectionList);
    menuContainer.add(clearButton);

    this.base(arguments, menuContainer, anchor);

    if(anchor) {
      this.setModal(false);
    } else {
      this._getBlocker().addListener("tap", this.__onBlockerTap, this);
    }
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired when the selection is changed.
     */
    changeSelection : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "menu"
    },


    /**
     * Indicates whether the menu should disappear when tap/click on blocker.
     */
    hideOnBlockerClick :
    {
      check : "Boolean",
      init : false
    },


    /**
     *  Class which is assigned to selected items.
     *  Useful for re-styling your menu via LESS.
     */
    selectedItemClass :
    {
      init : "item-selected"
    },


    /**
     * Class which is assigned to unselected items.
     * Useful for re-styling your menu via LESS.
     */
    unselectedItemClass :
    {
      init : "item-unselected"
    },


    /**
     * Defines if the menu has a null value in the list, which can be chosen
     * by the user. The label
     */
    nullable :
    {
      init : false,
      check : "Boolean",
      apply : "_applyNullable"
    },


    /**
     * The label of the null value entry of the list. Only relevant
     * when nullable property is set to <code>true</code>.
     */
    clearButtonLabel :
    {
      init : "None",
      check : "String",
      apply : "_applyClearButtonLabel"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __selectionList: null,
    __selectedIndex: null,
    __clearButton : null,


    /**
     * Creates the selection list. Override this to customize the widget.
     *
     * @return {qx.ui.mobile.list.List} The selection list
     */
    _createSelectionList : function() {
      var self = this;
      var selectionList = new qx.ui.mobile.list.List({
        configureItem : function(item, data, row)
        {
          item.setTitle(data);
          item.setShowArrow(false);

          var isItemSelected = (self.__selectedIndex == row);

          if(isItemSelected) {
            item.removeCssClass(self.getUnselectedItemClass());
            item.addCssClass(self.getSelectedItemClass());
          } else {
            item.removeCssClass(self.getSelectedItemClass());
            item.addCssClass(self.getUnselectedItemClass());
          }
        }
      });

      // Add an changeSelection event
      selectionList.addListener("changeSelection", this.__onListChangeSelection, this);
      selectionList.addListener("tap", this.__onListTap, this);

      return selectionList;
    },


    /**
     *  Sets the choosable items of the menu.
     *
     *  @param itemsModel {qx.data.Array}, the model of choosable items in the menu.
     */
    setItems : function (itemsModel) {
      if(this.__selectionList) {
        this.__selectionList.setModel(null);
        this.__selectionList.setModel(itemsModel);
      }
    },


    /**
     * Sets the pre-selected item.
     * Set selectedIndex before model, because changing model triggers rendering of list.
     * @param selectedIndex {Number}, the index of the item which should be pre-selected.
     */
    setSelectedIndex : function (selectedIndex) {
      this.__selectedIndex = selectedIndex;
    },


    /**
     * Hides the menu, fires an event which contains index and data.
     * @param evt {qx.event.type.Data}, contains the selected index number.
     */
    __onListChangeSelection : function (evt) {
      var selectedIndex = evt.getData();
      var selectedItem = this.__selectionList.getModel().getItem(selectedIndex);
      this.setSelectedIndex(selectedIndex);
      this._render();

      this.fireDataEvent("changeSelection", {index: selectedIndex, item: selectedItem});
    },


    /**
     * Reacts on blocker tap.
     */
    __onBlockerTap : function () {
      if(this.getHideOnBlockerClick()) {
        // Just hide dialog, no changes.
        this.hide();
      }
    },


    /**
     * Event handler for tap on clear button.
     */
    __onClearButtonTap : function() {
      this.fireDataEvent("changeSelection", {index: null, item: null});
      
      // Last event which is fired by tap is a click event,
      // so hide menu after click event.
      // If menu is hidden before click-event, event will bubble to ui
      // element which is behind menu, and might cause an unexpected action.
      qx.event.Timer.once(this.hide, this, 500);
    },


    // property apply
    _applyNullable : function(value, old) {
      if(value){
        this.__clearButton.setVisibility("visible");
      } else {
        this.__clearButton.setVisibility("excluded");
      }
    },


    // property apply
    _applyClearButtonLabel : function(value, old) {
       this.__clearButton.setValue(value);
    },


    /**
     * Reacts on selection list click.
     */
    __onListTap : function () {
        // Last event which is fired by tap on List is a click event,
        // so hide menu, first on click event.
        // If menu is hidden before click-event, event will bubble to ui
        // element which is behind menu, and might cause an unexpected action.
        qx.event.Timer.once(this.hide, this, 500);
    },


    /**
     * Triggers (re-)rendering of menu items.
     */
    _render : function() {
        var tmpModel = this.__selectionList.getModel();
        this.__selectionList.setModel(null);
        this.__selectionList.setModel(tmpModel);
    }
  },

  /*
  *****************************************************************************
      DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("__selectionList","__clearButton");
  }

});
