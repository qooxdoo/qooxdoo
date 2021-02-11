/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 *
 * The picker widget gives the user the possibility to select a value out of an array
 * of values. The picker widget can be added to a {@link qx.ui.mobile.dialog.Popup} or to any other container.
 *
 * The picker widget is able to display multiple picker slots, for letting the user choose
 * several values at one time, in one single control.
 *
 * You can add an array with objects which contain the keys <code>title</code>, a <code>subtitle</code> or an <code>image</code> (all optional).
 *
 * <pre>
 * var picker = new qx.ui.mobile.control.Picker();
 * picker.setHeight(200);
 * picker.addListener("changeSelection", function(evt) {
 *   var data = evt.getData();
 * },this);
 *
 * var slotData1 = [{title:"Windows Phone"}, {title:"iOS",subtitle:"Version 7.1"}, {title:"Android"}];
 * var slotData2 = [{title:"Tablet"}, {title:"Smartphone"}, {title:"Phablet"}];
 *
 * picker.addSlot(new qx.data.Array(slotData1));
 * picker.addSlot(new qx.data.Array(slotData2));
 * </pre>
 *
 */
qx.Class.define("qx.ui.mobile.control.Picker",
{
  extend : qx.ui.mobile.container.Composite,


  construct : function()
  {
    this.base(arguments);

    this._pickerModel = new qx.data.Array();
    this._slots = new qx.data.Array();

    this.addListener("appear", this._onAppear, this);
    this.initVisibleItems();
  },


  events :
  {
    /**
     * Fired when the selection of a slot has changed.
     * Example:
     * <code> {
     *   index: 0,
     *   item: [Object],
     *   slot: 0
     * }</code>
     */
    changeSelection : "qx.event.type.Data"
  },


  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "picker"
    },


    /**
    * Controls how much visible items are shown inside the picker.
    */
    visibleItems : {
      init : 5,
      check : [3,5,7,9],
      apply : "_applyVisibleItems"
    },


    /**
    * Controls the picker height.
    */
    height : {
      init : 200,
      check : "Number"
    }
  },


  members :
  {
    _slots : null,
    _pickerModel : null,


    /**
    * Handler for <code>appear</code> event of this widget.
    */
    _onAppear: function() {
      var itemHeight = this._calcItemHeight();
      this._slots.forEach(function(slot, index) {
        qx.bom.AnimationFrame.request(function() {
          slot.container.scrollTo(0, slot.selectedIndex * itemHeight);
        });
      }, this);
    },


    // property apply
    _applyVisibleItems : function(value) {
      this._setAttribute("data-items",value);
    },


    /**
    * Returns the internal used picker model which contains one or more picker slot models.
    * @return {qx.data.Array} the picker model.
    */
    getModel : function() {
      return this._pickerModel;
    },


    /**
     * Creates a picker slot.
     * @param slotModel {qx.data.Array} the picker slot model.
     * @param slotIndex {Number} the index of this slot.
     * @param delegate {qx.ui.mobile.list.IListDelegate?null} the list delegate object for this slot list.
     * @return {qx.ui.mobile.container.Scroll} the picker slot as a scroll container.
     */
    _createPickerSlot : function(slotModel, slotIndex, delegate) {
      var scrollContainer = new qx.ui.mobile.container.Scroll({
        "snap": ".list-item",
        "vScrollbar" : false
      });
      scrollContainer.setWaypointsY([".list-item"]);

      qx.bom.element.Style.set(scrollContainer.getContentElement(), "height", this.getHeight() + "px");

      var slot = {
        container: scrollContainer,
        selectedIndex: 0
      };

      this._slots.push(slot);

      scrollContainer.addListener("waypoint", this._onWaypoint, {
        self: this,
        slot : slot,
        slotIndex : slotIndex,
        slotModel : slotModel
      });

      var list = new qx.ui.mobile.list.List(delegate);
      list.setItemHeight(this._calcItemHeight());
      list.addListener("changeSelection", this._onChangeSelection, {
        self: this,
        slotIndex: slotIndex
      });
      list.setModel(slotModel);

      var slotWrapper = new qx.ui.mobile.container.Composite();

      // Generate placeholder items at before and after picker data list,
      // for making sure the first and last item can be scrolled
      // to the center of the picker.
      var placeholderItemCount = Math.floor(this.getVisibleItems() / 2);
      for (var i = 0; i < placeholderItemCount; i++) {
        slotWrapper.add(this._createPlaceholderItem());
      }
      slotWrapper.add(list);
      for (var j = 0; j < placeholderItemCount; j++) {
        slotWrapper.add(this._createPlaceholderItem());
      }
      scrollContainer.add(slotWrapper);
      this.add(scrollContainer);

      scrollContainer.refresh();

      return scrollContainer;
    },


    /**
    * Creates a placeholder list item, for making sure the selected item is vertically centered.
    * @return {qx.ui.mobile.container.Composite} the placeholder list item.
    */
    _createPlaceholderItem : function() {
      var placeholderItem = new qx.ui.mobile.container.Composite();
      qx.bom.element.Style.set(placeholderItem.getContentElement(), "minHeight", this._calcItemHeight() + "px");
      placeholderItem.addCssClass("list-item");
      placeholderItem.addCssClass("placeholder-item");
      return placeholderItem;
    },


    /**
    * Calculates the item height of a picker item.
    * @return {Number} height of the picker item.
    */
    _calcItemHeight : function() {
      return this.getHeight() / this.getVisibleItems();
    },


    /**
    * Handler for <code>changeSelection</code> event on picker list.
    * @param evt {qx.event.type.Data} the events data.
    */
    _onChangeSelection: function(evt) {
      qx.Bootstrap.bind(this.self.setSelectedIndex, this.self, this.slotIndex, evt.getData()).call();
    },


    /**
    * Handler for <code>waypoint</code> event on scroll container.
    * @param evt {qx.event.type.Data} the waypoint data.
    */
    _onWaypoint: function(evt) {
      var elementIndex = evt.getData().element;
      this.slot.selectedIndex = elementIndex;

      this.self.fireDataEvent("changeSelection", {
        index: elementIndex,
        item: this.slotModel.getItem(elementIndex),
        slot: this.slotIndex
      });
    },


    /**
    * Getter for the selectedIndex of a picker slot, identified by its index.
    * @param slotIndex {Integer} the index of the target picker slot.
    * @return {Integer} the index of the target picker slot, or null if slotIndex is unknown.
    */
    getSelectedIndex : function(slotIndex) {
      return this._slots.getItem(slotIndex).selectedIndex;
    },


    /**
     * Setter for the selectedIndex of a picker slot, identified by its index.
     * @param slotIndex {Integer} the index of the target picker slot.
     * @param selectedIndex {Integer} the selectedIndex of the slot.
     */
    setSelectedIndex: function(slotIndex, selectedIndex) {
      var slot = this._slots.getItem(slotIndex);
      slot.selectedIndex = selectedIndex;
      if (this.isVisible()) {
        slot.container.scrollTo(0, selectedIndex * this._calcItemHeight());
      }
    },


    /**
     * Returns the picker slot count, added to this picker.
     * @return {Integer} count of picker slots.
     */
    getSlotCount : function() {
      return this._pickerModel.getLength();
    },


    /**
     * Adds an picker slot to the end of the array.
     * @param slotModel {qx.data.Array} the picker slot model to display.
     * @param delegate {qx.ui.mobile.list.IListDelegate?null} the list delegate object for this slot.
     */
    addSlot : function(slotModel, delegate) {
      if(slotModel !== null && slotModel instanceof qx.data.Array) {
        this._pickerModel.push(slotModel);
        var slotIndex = this._pickerModel.length - 1;

        var scrollContainer = this._createPickerSlot(slotModel, slotIndex, delegate);

        slotModel.addListener("changeBubble", this._onSlotDataChange, scrollContainer);
        slotModel.addListener("change", this._onSlotDataChange, scrollContainer);
      }
    },


    /**
     * Removes the picker slot at the given slotIndex.
     * @param slotIndex {Integer} the index of the target picker slot.
     */
    removeSlot : function(slotIndex) {
      if(this._pickerModel.length > slotIndex && slotIndex > -1) {
        var slotModel = this._pickerModel.getItem(slotIndex);
        var scrollContainer = this._slots.getItem(slotIndex).container;

        slotModel.removeListener("changeBubble", this._onSlotDataChange, scrollContainer);
        slotModel.removeListener("change", this._onSlotDataChange, scrollContainer);

        qx.util.DisposeUtil.destroyContainer(scrollContainer);

        this._pickerModel.removeAt(slotIndex);
        this._slots.removeAt(slotIndex);
      }
    },


    /**
    * Handles the <code>changeBubble</code> and <codechange></code> event on a picker slot model.
    */
    _onSlotDataChange : function() {
      window.setTimeout(function() {
        this.refresh();
      }.bind(this), 0);
    }
  },


  destruct : function()
  {
    this._pickerModel.dispose();
    this._slots.dispose();
    qx.util.DisposeUtil.destroyContainer(this);
  }
});
