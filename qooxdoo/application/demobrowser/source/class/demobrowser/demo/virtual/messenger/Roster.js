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
   * Fabian Jakobs (fjakobs)
   * Jonathan Weiß (jonathan_rass)
   * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.messenger.Roster",
{
  extend : qx.ui.core.Widget,

  construct : function()
  {
    this.base(arguments);

    this.__groups = {};
    
    var layout = new qx.ui.layout.VBox();
    this._setLayout(layout);
    
    var list = this.list = new qx.ui.list.List();
    list.set({
      scrollbarX: "off",
      scrollbarY: "auto",
      width: 200,
      height: 300,
      itemHeight: 28,
      decorator: null,
      autoGroupCreation: false
    });
    list.setDelegate(this);
    this._add(list, {flex: 1});
    
    this.initModel(new qx.data.Array());
    this.initSelection(list.getSelection());
    this.__groupsList = list.getGroups();

    this.bind("model", list, "model");

    // configure row colors
    var rowLayer = list.getChildControl("row-layer");
    rowLayer.set({
      colorEven: "white",
      colorOdd: "rgb(238, 243, 255)"
    });
    
    // Creates the prefetch behavior
    new qx.ui.virtual.behavior.Prefetch(
      list,
      {
        minLeft : 0,
        maxLeft : 0,
        minRight : 0,
        maxRight : 0,
        minAbove : 600,
        maxAbove : 800,
        minBelow : 600,
        maxBelow : 800
      }
    ).set({
      interval: 500
    });
  },

  properties :
  {
    model :
    {
      check : "qx.data.Array",
      event : "changeModel",
      nullable : false,
      deferredInit : true
    },

    selection :
    {
      check : "qx.data.Array",
      event : "changeSelection",
      nullable : false,
      deferredInit : true
    }
  },
  
  members :
  {
    __groups : null,
    
    __groupsList : null,
    

    /*
    ---------------------------------------------------------------------------
      DELEGATE IMPLEMENTATION
    ---------------------------------------------------------------------------
    */
    
    
    createItem : function() {
      return new demobrowser.demo.virtual.messenger.Buddy();
    },
    
    
    createGroupItem : function() {
      return new demobrowser.demo.virtual.messenger.Group();
    },
    
    
    bindItem : function(controller, item, id)
    {
      controller.bindProperty("name", "name", null, item, id);
      controller.bindProperty("avatar", "avatar", null, item, id);
      controller.bindProperty("status", "status", null, item, id);
    },
    
    
    bindGroupItem : function(controller, item, id)
    {
      var that = this;
      controller.bindProperty("name", "name", null, item, id);
      controller.bindProperty("count", "count", null, item, id);
      controller.bindProperty("open", "open", null, item, id);
      controller.bindPropertyReverse("open", "open", null, item, id);
    },
    
    
    filter : function(data) {
      return this.__getGroupFor(data.getGroup()).isOpen();
    },
    
    
    sorter : function(a, b) {
      return a.getName() < b.getName() ? -1 : 1;
    },
    
    
    group : function(data) {
      return this.__getGroupFor(data.getGroup());
    },
    
    
    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */
    
    
    __getGroupFor : function(name) {
      var group = this.__groups[name];
      
      if (group != null) {
        return group;
      }
      
      group = this.__groups[name] = new demobrowser.demo.virtual.messenger.GroupModel(name);
      group.addListener("changeOpen", this.__onChangeOpen, this);
      this.__groupsList.push(group);
      return group;
    },
    
    __onChangeOpen : function(event) {
      this.list.refresh();
    }
  }
});