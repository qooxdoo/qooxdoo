/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/64/devices/*)
#asset(qx/icon/${qx.icontheme}/64/actions/object-flip-horizontal.png)

************************************************************************ */
qx.Class.define("showcase.page.dragdrop.Content",
{
  extend : showcase.AbstractContent,

  construct : function(page) {
    this.base(arguments, page);

    this.setView(this._createView());
  },


  members :
  {
    __dragFeedback : null,
    __dragoverItem : null,


    _createView : function()
    {
      var layout = new qx.ui.layout.Grid();
      layout.setRowFlex(1, 1);
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(2, 1);
      layout.setColumnAlign(1, "center", "middle");
      var view = new qx.ui.container.Composite(layout);
      view.setPadding(20);

      view.add(new qx.ui.basic.Label("Shop").set({
        appearance: "groupbox/legend",
        paddingBottom: 5
      }), {row: 0, column: 0});
      view.add(new qx.ui.basic.Label("Cart").set({
        appearance: "groupbox/legend",
        paddingBottom: 5
      }), {row: 0, column: 2});

      var shopList = new qx.ui.form.List();
      shopList.set({
        draggable: true,
        droppable: true
      });
      view.add(shopList, {row: 1, column: 0});
      shopList.addListener("dragstart", this.__onDragStart, this);
      shopList.addListener("droprequest", this.__onDropRequest, this);
      shopList.addListener("drop", this.__onDrop, this);
      shopList.addListener("drag", this.__onDrag, this);
      shopList.addListener("dragend", this.__onDragEnd, this);

      var spacer = new qx.ui.basic.Image("icon/64/actions/object-flip-horizontal.png");
      spacer.setPadding(10);
      view.add(spacer, {row: 1, column: 1});

      var cartList = new qx.ui.form.List();
      cartList.set({
        draggable: true,
        droppable: true
      });
      view.add(cartList, {row: 1, column: 2});
      cartList.addListener("dragstart", this.__onDragStart, this);
      cartList.addListener("droprequest", this.__onDropRequest, this);
      cartList.addListener("drop", this.__onDrop, this);
      cartList.addListener("drag", this.__onDrag, this);
      cartList.addListener("dragend", this.__onDragEnd, this);


      var items = qx.data.marshal.Json.createModel([
        {"name" : "Scanner", "icon" :"scanner"},
        {"name" : "Soundblaster", "icon" :"audio-card"},
        {"name" : "Mic.", "icon" :"audio-input-microphone"},
        {"name" : "Battery", "icon" :"battery"},
        {"name" : "Camera", "icon" :"camera-photo"},
        {"name" : "Webcam", "icon" :"camera-web"},
        {"name" : "Computer", "icon" :"computer"},
        {"name" : "Display", "icon" :"display"},
        {"name" : "HDD", "icon" :"drive-harddisk"},
        {"name" : "BluRay Drive", "icon" :"drive-optical"},
        {"name" : "Keyboard", "icon" :"input-keyboard"},
        {"name" : "Mouse", "icon" :"input-mouse"},
        {"name" : "SD Card", "icon" :"media-flash"},
        {"name" : "DVD", "icon" :"media-optical"},
        {"name" : "iPod", "icon" :"multimedia-player"},
        {"name" : "Network Cable", "icon" :"network-wired"},
        {"name" : "WiFi", "icon" :"network-wireless"},
        {"name" : "PDA", "icon" :"pda"},
        {"name" : "Cell Phone", "icon" :"phone"},
        {"name" : "Printer", "icon" :"printer"}
      ]);

      var controller = new qx.data.controller.List(null, shopList);

      controller.setLabelPath("name");
      controller.setIconPath("icon");
      controller.setIconOptions({
        converter : function(data) {
          return "icon/64/devices/" + data + ".png";
        }
      });
      controller.setModel(items);


      var dragFeedback = new qx.ui.form.ListItem();
      this.__dragFeedback = dragFeedback;
      dragFeedback.setOpacity(0.5);
      dragFeedback.setZIndex(500);
      dragFeedback.addState("selected");
      dragFeedback.setLayoutProperties({left: -1000, top: -1000});
      qx.core.Init.getApplication().getRoot().add(dragFeedback);


      return view;
    },


    __onDrop : function(e) {
      var selection = e.getData("items");
      var target = e.getOriginalTarget();
      var list = e.getTarget();

      if (target instanceof qx.ui.form.List) {
        for (var i=0, l=selection.length; i<l; i++) {
          list.add(selection[i]);
        }
      } else if (target instanceof qx.ui.form.ListItem) {
        for (var i=selection.length - 1; i >= 0; i--) {
          list.addAfter(selection[i], target);
        }
      }
    },


    __onDropRequest : function(e)
    {
      var list = e.getTarget();
      var selection = list.getSelection().concat();
      e.addData("items", selection);
    },


    __onDragStart : function(e) {
      e.addType("items");
      e.addAction("move");

      var item = e.getTarget().getSelection()[0];
      this.__dragFeedback.set({
        label: item.getLabel(),
        icon: item.getIcon(),
        width: item.getBounds().width
      });
    },


    __onDragEnd : function(e)
    {
      this.__dragoverItem && this.__dragoverItem.removeState("dragover");
      this.__dragFeedback.setDomPosition(-1000, -1000);
    },


    __onDrag : function(e) {
      var item = e.getOriginalTarget();
      if (item instanceof qx.ui.form.ListItem) {
        if (item != this.__dragoverItem) {
          this.__dragoverItem && this.__dragoverItem.removeState("dragover");
          item.addState("dragover");
          this.__dragoverItem = item;
        }
      } else {
        this.__dragoverItem && this.__dragoverItem.removeState("dragover");
      }
      this.__dragFeedback.setDomPosition(e.getDocumentLeft() + 15, e.getDocumentTop() + 15);
    }
  }
});