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

************************************************************************ */
qx.Class.define("showcase.page.dragdrop.Content",
{
  extend : showcase.AbstractContent,
  
  construct : function(page) {
    this.base(arguments, page);
    
    this.setView(this.__createView());
  },
    
  
  members :
  {
    __createView : function() 
    {
      var layout = new qx.ui.layout.Grid();
      layout.setRowFlex(1, 1);
      layout.setColumnFlex(0, 1);
      layout.setColumnFlex(2, 1);    
      var view = new qx.ui.container.Composite(layout);
      view.setPadding(20);

      view.add(new qx.ui.basic.Label("Shop"), {row: 0, column: 0});
      view.add(new qx.ui.basic.Label("Cart"), {row: 0, column: 2});
      
      var shopList = new qx.ui.form.List();
      shopList.set({
        draggable: true,
        droppable: true,
        selectionMode: "multi"
      });
      view.add(shopList, {row: 1, column: 0});
      shopList.addListener("dragstart", this.__onDragStart, this);
      shopList.addListener("droprequest", this.__onDropRequest, this);
      shopList.addListener("drop", this.__onDrop, this);     
      
      var spacer = new qx.ui.core.Spacer(50);
      view.add(spacer, {row: 1, column: 1});
      
      var cartList = new qx.ui.form.List();
      cartList.set({
        draggable: true,
        droppable: true,
        selectionMode: "multi"
      });
      view.add(cartList, {row: 1, column: 2});
      cartList.addListener("dragstart", this.__onDragStart, this);
      cartList.addListener("droprequest", this.__onDropRequest, this);
      cartList.addListener("drop", this.__onDrop, this);      
      
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
      shopList.setUserData("controller", controller);
      
      var controller = new qx.data.controller.List(null, cartList);

      controller.setLabelPath("name");
      controller.setIconPath("icon");      
      controller.setIconOptions({
        converter : function(data) {
          return "icon/64/devices/" + data + ".png";
        }
      });
      controller.setModel(new qx.data.Array());
      cartList.setUserData("controller", controller);      
      
      
      return view;
    },
    
    
    __onDrop : function(e) {
      var selection = e.getData("items");
      var controller = e.getTarget().getUserData("controller");
      for (var i=0, l=selection.length; i<l; i++) {
        controller.getModel().push(selection[i]);
      }      
    },
    
    __onDropRequest : function(e) 
    {
      var controller = e.getTarget().getUserData("controller");
      var selection = controller.getSelection().toArray().concat();
      for (var i=0, l=selection.length; i<l; i++) {
        controller.getModel().remove(selection[i]);
      }
      e.addData("items", selection);
    },
    
    __onDragStart : function(e) {
      e.addType("items");
      e.addAction("move");
    }
  }
});