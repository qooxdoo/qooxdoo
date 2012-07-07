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

qx.Class.define("showcase.page.virtuallist.messenger.Roster",
{
  extend : qx.ui.core.Widget,

  construct : function()
  {
    this.base(arguments);

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
      autoGrouping: false
    });
    list.setDelegate(this);
    this._add(list, {flex: 1});

    this.initGroups(list.getGroups());
    this.initModel(new qx.data.Array());
    this.initSelection(list.getSelection());

    this.bind("model", list, "model");

    // configure row colors
    var rowLayer = list.getChildControl("row-layer");
    rowLayer.set({
      colorEven: "progressive-table-row-background-even",
      colorOdd: "progressive-table-row-background-odd"
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
      apply : "_applyModel",
      nullable : false,
      deferredInit : true
    },

    selection :
    {
      check : "qx.data.Array",
      event : "changeSelection",
      nullable : false,
      deferredInit : true
    },

    groups :
    {
      check : "qx.data.Array",
      event : "changeGroup",
      nullable : false,
      deferredInit : true
    }
  },

  members :
  {
    /*
    ---------------------------------------------------------------------------
      DELEGATE IMPLEMENTATION
    ---------------------------------------------------------------------------
    */


    createItem : function() {
      return new showcase.page.virtuallist.messenger.Buddy();
    },


    createGroupItem : function() {
      return new showcase.page.virtuallist.messenger.Group();
    },


    bindItem : function(controller, item, id)
    {
      controller.bindProperty("name", "name", null, item, id);
      controller.bindProperty("avatar", "avatar", null, item, id);
      controller.bindProperty("status", "status", null, item, id);
    },


    bindGroupItem : function(controller, item, id)
    {
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


    _applyModel : function(value, old)
    {
      value.addListener("change", this.__updateGroup, this);
      value.addListener("changeBubble", this.__updateGroup, this);

      if(old != null)
      {
        old.removeListener("change", this.__updateGroup, this);
        old.removeListener("changeBubble", this.__updateGroup, this);
      }

      this.__updateGroup();
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


    __updateGroup : function(event)
    {
      var model = this.getModel();
      var groups = this.getGroups();

      var groupsCount = {};
      for (var i = 0; i < groups.getLength(); i++)
      {
        var group = groups.getItem(i);
        groupsCount[group.getName()] = 0;
      }

      for (var i = 0; i < model.getLength(); i++)
      {
        var group = model.getItem(i).getGroup();

        if (groupsCount[group] == null) {
          groupsCount[group] = 1;
        } else {
          groupsCount[group] += 1;
        }
      }

      for (var name in groupsCount)
      {
        var count = groupsCount[name];
        var group = this.__getGroupFor(name);
        group.setCount(count);
      }

      if (event && event.getType() == "changeBubble") {
        this.list.refresh();
      }
    },


    __getGroupFor : function(name)
    {
      var groups = this.getGroups();
      var group = null;

      for (var i = 0; i < groups.getLength(); i++) {
        var item = groups.getItem(i);

        if (name == item.getName()) {
          group = item;
          break;
        }
      }

      if (group == null)
      {
        group = new showcase.page.virtuallist.messenger.GroupModel(name);
        group.addListener("changeOpen", this.__onChangeOpen, this);
        groups.push(group);
      }

      return group;
    },


    __onChangeOpen : function(event) {
      this.list.refresh();
    }
  }
});