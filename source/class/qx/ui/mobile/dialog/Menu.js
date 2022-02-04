/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * This widget displays a menu. A dialog menu extends a popup and contains a
 * list, which provides the user the possibility to select one value.
 * The selected value is identified through selected index.
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
qx.Class.define("qx.ui.mobile.dialog.Menu", {
  extend: qx.ui.mobile.dialog.Popup,

  /**
   * @param itemsModel {qx.data.Array ?}, the model which contains the choosable items of the menu.
   * @param anchor {qx.ui.mobile.core.Widget ?} The anchor widget for this item. If no anchor is available, the menu will be displayed modal and centered on screen.
   */
  construct(itemsModel, anchor) {
    // Create the list with a delegate that
    // configures the list item.
    this.__selectionList = this._createSelectionList();

    if (itemsModel) {
      this.__selectionList.setModel(itemsModel);
    }

    this.__menuContainer = new qx.ui.mobile.container.Composite();
    this.__clearButton = this._createClearButton();
    this.__listScroller = this._createListScroller(this.__selectionList);

    this.__menuContainer.add(this.__listScroller);
    this.__menuContainer.add(this.__clearButton);

    super(this.__menuContainer, anchor);

    if (anchor) {
      this.setModal(false);
    } else {
      this.setModal(true);
    }
  },

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * Fired when the selection is changed.
     */
    changeSelection: "qx.event.type.Data"
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    // overridden
    defaultCssClass: {
      refine: true,
      init: "menu"
    },

    /**
     *  Class which is assigned to selected items.
     *  Useful for re-styling your menu via LESS.
     */
    selectedItemClass: {
      init: "item-selected"
    },

    /**
     * Class which is assigned to unselected items.
     * Useful for re-styling your menu via LESS.
     */
    unselectedItemClass: {
      init: "item-unselected"
    },

    /**
     * Defines if the menu has a null value in the list, which can be chosen
     * by the user. The label
     */
    nullable: {
      init: false,
      check: "Boolean",
      apply: "_applyNullable"
    },

    /**
     * The label of the null value entry of the list. Only relevant
     * when nullable property is set to <code>true</code>.
     */
    clearButtonLabel: {
      init: "None",
      check: "String",
      apply: "_applyClearButtonLabel"
    },

    /**
     * The selected index of this menu.
     */
    selectedIndex: {
      check: "Integer",
      apply: "_applySelectedIndex",
      nullable: true
    },

    /**
     * This value defines how much list items are visible inside the menu.
     */
    visibleListItems: {
      check: "Integer",
      apply: "_updatePosition",
      nullable: true
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __selectionList: null,
    __clearButton: null,
    __listScroller: null,
    __menuContainer: null,

    // overridden
    show() {
      super.show();

      this.scrollToItem(this.getSelectedIndex());
    },

    /**
     * Creates the clearButton. Override this to customize the widget.
     *
     * @return {qx.ui.mobile.form.Button} the clearButton of this menu.
     */
    _createClearButton() {
      var clearButton = new qx.ui.mobile.form.Button(
        this.getClearButtonLabel()
      );

      clearButton.addListener("tap", this.__onClearButtonTap, this);
      clearButton.exclude();
      return clearButton;
    },

    /**
     * Creates the scroll container for the selectionList. Override this to customize the widget.
     * @param selectionList {qx.ui.mobile.list.List} The selectionList of this menu.
     * @return {qx.ui.mobile.container.Scroll} the scroll container which contains the selectionList of this menu.
     */
    _createListScroller(selectionList) {
      var listScroller = new qx.ui.mobile.container.Scroll({
        snap: ".list-item"
      });

      listScroller.add(selectionList, {
        flex: 1
      });

      listScroller.addCssClass("menu-scroller");
      return listScroller;
    },

    /**
     * Getter for the scroll container which contains a @see {qx.ui.mobile.list.List} with the choosable items.
     * @return {qx.ui.mobile.container.Scroll} the scroll container which contains the selectionList of this menu.
     */
    _getListScroller() {
      return this.__listScroller;
    },

    // overridden
    _updatePosition() {
      var parentHeight = qx.ui.mobile.dialog.Popup.ROOT.getHeight();
      var listScrollerHeight = parseInt(parentHeight, 10) * 0.75;
      listScrollerHeight = parseInt(listScrollerHeight, 10);

      if (this.getVisibleListItems() !== null) {
        var newListScrollerHeight =
          this.__selectionList.getListItemHeight() * this.getVisibleListItems();
        listScrollerHeight = Math.min(
          newListScrollerHeight,
          listScrollerHeight
        );
      }

      qx.bom.element.Style.set(
        this.__listScroller.getContainerElement(),
        "maxHeight",
        listScrollerHeight + "px"
      );

      super._updatePosition();
    },

    /**
     * Creates the selection list. Override this to customize the widget.
     *
     * @return {qx.ui.mobile.list.List} The selectionList of this menu.
     */
    _createSelectionList() {
      var self = this;
      var selectionList = new qx.ui.mobile.list.List({
        configureItem(item, data, row) {
          item.setTitle(data);
          item.setShowArrow(false);

          var isItemSelected = self.getSelectedIndex() == row;

          if (isItemSelected) {
            item.removeCssClass(self.getUnselectedItemClass());
            item.addCssClass(self.getSelectedItemClass());
          } else {
            item.removeCssClass(self.getSelectedItemClass());
            item.addCssClass(self.getUnselectedItemClass());
          }
        }
      });

      // Add an changeSelection event
      selectionList.addListener(
        "changeSelection",
        this.__onListChangeSelection,
        this
      );

      selectionList.addListener("tap", this._onSelectionListTap, this);
      return selectionList;
    },

    /**
     * Getter for the selectionList of the menu.
     * @return {qx.ui.mobile.list.List} The selectionList of this menu.
     */
    getSelectionList() {
      return this.__selectionList;
    },

    /** Handler for tap event on selection list. */
    _onSelectionListTap() {
      this.hideWithDelay(500);
    },

    /**
     * Sets the choosable items of the menu.
     * @param itemsModel {qx.data.Array}, the model of choosable items in the menu.
     */
    setItems(itemsModel) {
      if (this.__selectionList) {
        this.__selectionList.setModel(null);
        this.__selectionList.setModel(itemsModel);
      }
    },

    /**
     * Fires an event which contains index and data.
     * @param evt {qx.event.type.Data}, contains the selected index number.
     */
    __onListChangeSelection(evt) {
      this.setSelectedIndex(evt.getData());
    },

    /**
     * Event handler for tap on clear button.
     */
    __onClearButtonTap() {
      this.fireDataEvent("changeSelection", { index: null, item: null });
      this.hide();
    },

    // property apply
    _applySelectedIndex(value, old) {
      var listModel = this.__selectionList.getModel();

      if (listModel !== null) {
        var selectedItem = listModel.getItem(value);
        this.fireDataEvent("changeSelection", {
          index: value,
          item: selectedItem
        });
      }

      this._render();
    },

    // property apply
    _applyNullable(value, old) {
      if (value) {
        this.__clearButton.setVisibility("visible");
      } else {
        this.__clearButton.setVisibility("excluded");
      }
    },

    // property apply
    _applyClearButtonLabel(value, old) {
      this.__clearButton.setValue(value);
    },

    /**
     * Triggers (re-)rendering of menu items.
     */
    _render() {
      var tmpModel = this.__selectionList.getModel();
      this.__selectionList.setModel(null);
      this.__selectionList.setModel(tmpModel);
    },

    /**
     * Scrolls the scroll wrapper of the selectionList to the item with given index.
     * @param index {Integer}, the index of the listItem to which the listScroller should scroll to.
     */
    scrollToItem(index) {
      if (index !== null && this.__selectionList.getModel() != null) {
        var listItems = qxWeb(
          "#" + this.__listScroller.getId() + " .list-item"
        );

        var targetListItemElement = listItems[index];
        this.__listScroller.scrollToElement(targetListItemElement);
      }
    }
  },

  destruct() {
    this.__selectionList.removeListener("tap", this._onSelectionListTap, this);
    this._disposeObjects(
      "__selectionList",
      "__clearButton",
      "__listScroller",
      "__menuContainer"
    );
  }
});
