/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.SettingsList",
{
  extend : qx.application.Standalone,

  members :
  {

    __data: null,

    /*
    *****************************************************************************
       MAIN
    *****************************************************************************
    */

    main: function()
    {
      this.base(arguments);

      //
      // Data
      //

      // Items
      var data = [];
      var names = ["Apple", "Orange", "Potato", "Carrot"];
      for (var i = 0; i < names.length; i++) {
        data[i] = {
          name : names[i],
          checked : i < 2,
          group: null
        };
      }
      this.__data = qx.data.marshal.Json.createModel(data, true);

      // Groups
      var groups = []
      for (var i = 0; i < 2; i++) {
        groups[i] = {
          name: null,
          checked: false
        };
      }
      groups = qx.data.marshal.Json.createModel(groups, true);
      groups.getItem(0).setName("Fruits");
      groups.getItem(1).setName("Vegetables");

      // Assign group
      this.__data.toArray().forEach(function(item, index) {
        index = index < 2 ? 0 : 1;
        item.setGroup(groups.getItem(index));
      });

      // Widgets
      var list = new qx.ui.list.List();
      list.setWidth(150);
      this.getRoot().add(list, {left: 20, top: 20});

      // Let the magic happen
      list.setDelegate(this);
      list.setModel(this.__data);
    },

    /*
    *****************************************************************************
       DELEGATE
    *****************************************************************************
    */

    //
    // This section implements qx.ui.list.core.IListDelegate.
    // Therefore, "this" is a valid delegate for qx.ui.list.List.
    //

    createItem : function() {
      return new qx.ui.form.CheckBox();
    },

    configureItem : function(item) {
      item.setPadding(3);
    },

    createGroupItem : function() {
      return new qx.ui.form.CheckBox();
    },

    configureGroupItem : function(group) {

      // Background
      group.setBackgroundColor("#ddd");

      // Setting value to null shows triState
      group.setTriState(true);

      // Sync value of items with value of group
      group.addListener("changeValue", function(e) {

        // Ignore change when triState was set. Avoids infinite loop.
        if (group.getValue() === null) {
          return;
        }

        var value = e.getData();

        // Find model entries where group matches label,
        // i.e. all entries that belong to group
        this.__data.forEach(function(entry) {
          if (group.getLabel() == entry.getGroup().getName()) {
            entry.setChecked(value);
          }
        });
      }, this);
    },

    bindItem : function(controller, item, id) {

      // Bind name -> label
      controller.bindProperty("name", "label", null, item, id);

      // Bind checked <-> value
      controller.bindProperty("checked", "value", null, item, id);
      controller.bindPropertyReverse("checked", "value", null, item, id);

      // Bind group.checked -> value
      //
      // Check group when all items that belong to group are checked
      var data = this.__data;
      controller.bindPropertyReverse("group.checked", "value", {
        converter: function(value, model) {

          var item = model.getItem(id);
          var group = item.getGroup();

          var itemsOfGroup = data.toArray().filter(function(item) {
            return item.getGroup() == group;
          });

          var isAllChecked = itemsOfGroup.every(function(item) {
            return item.getChecked();
          });

          var isOneChecked = itemsOfGroup.some(function(item) {
            return item.getChecked();
          });

          // Set triState when one item in group is checked
          if (isOneChecked) {
            return isAllChecked ? true : null;
          } else {
            return false;
          }

        }
      }, item, id);

    },

    bindGroupItem : function(controller, group, id) {
      // Bind name -> label
      controller.bindProperty("name", "label", null, group, id);

      // Bind checked <-> value
      controller.bindProperty("checked", "value", null, group, id);
      controller.bindPropertyReverse("checked", "value", null, group, id);
    },

    group : function(model) {
      return model.getGroup();
    }
  }
});
