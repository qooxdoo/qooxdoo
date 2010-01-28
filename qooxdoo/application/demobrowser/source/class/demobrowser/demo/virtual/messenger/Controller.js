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
qx.Class.define("demobrowser.demo.virtual.messenger.Controller",
{
  extend : qx.ui.virtual.form.ListController,

  construct : function(model, target)
  {
    this.base(arguments, model, target);

    this.__buddyCell = new demobrowser.demo.virtual.messenger.BuddyCell();

    this.__groupCell = new demobrowser.demo.virtual.messenger.GroupCell();
    this.__groupCell.addListener("changeOpen", this._onChangeOpenGroup, this);

    this.__groups = [];
    this.__groupPool = {};
    this.__groupedData = [];

    this.__deferredUpdate = new qx.util.DeferredCall(this._updateGrouping, this);
  },

  members :
  {
    __groupedData : null,
    __groupPool : null,
    __deferredUpdate : null,
    __groups : null,
    __buddyCell : null,
    __groupCell : null,

    _getRowData : function(row) {
      return this.__groupedData[row]
    },


    _getModelRow : function(modelItem) {
      return this.__groupedData.indexOf(modelItem);
    },


    _getRowCount : function() {
      return this.__groupedData.length;
    },


    _isGroupHeader : function(row) {
      return this.__groupedData[row] instanceof demobrowser.demo.virtual.messenger.GroupModel;
    },


    _getGroupModel : function(name, row)
    {
      var group = this.__groupPool[name];
      if (!group)
      {
        var group = new demobrowser.demo.virtual.messenger.GroupModel();
        group.setName(name);
        this.__groupPool[name] = group;
      }
      group.setRow(row);
      return group;
    },


    _onChangeOpenGroup : function(e)
    {
      var group = this.__groupedData[e.getData().getUserData("cell.row")];
      group.toggleOpen();

      this.__deferredUpdate.schedule();
    },


    getCellRenderer: function(row)
    {
      if (this._isGroupHeader(row)) {
        return this.__groupCell;
      } else {
        return this.__buddyCell;
      }
    },


    isRowSelectable : function(row) {
      return !this._isGroupHeader(row);
    },


    _visualizeGrouping : function(groups)
    {
      var target = this.getTarget();
      if (target)
      {
        for (var i=0; i<this.__groups.length; i++)
        {
          var row = this.__groups[i].getOldRow();
          if (row !== null) {
            target.unstyleGroup(row);
          }
        }
        for (var i=0; i<groups.length; i++)
        {
          var row = groups[i].getRow();
          target.styleGroup(row);
        }
      }
      this.__groups = groups;
    },


    _updateGrouping : function()
    {
      var model = this.getModel();

      this.__groupedData = [];
      var data = [];
      var groups = [];

      if (model && model.length > 0)
      {
        data = qx.lang.Array.clone(model.toArray());
        data.sort(function(a, b)
        {
          var groupA = a.getGroup();
          var groupB = b.getGroup();

          if (groupA == groupB) {
            return a.getName() < b.getName() ? -1 : 1;
          }

          return groupA > groupB ? -1 : 1;
        });

        var firstItem = data[0];
        var group = this._getGroupModel(firstItem.getGroup(), 0);
        this.__groupedData.push(group);
        groups.push(group);

        var itemsInGroup = 0;
        for (var i=0; i<data.length; i++)
        {
          var item = data[i];
          if (item.getGroup() !== group.getName())
          {
            group.setItemCount(itemsInGroup);
            itemsInGroup = 0;

            var group = this._getGroupModel(item.getGroup(), this.__groupedData.length);
            this.__groupedData.push(group);
            groups.push(group);
          }
          if (group.isOpen()) {
            this.__groupedData.push(item);
          } else {
            this.getSelection().remove(item);
          }
          itemsInGroup += 1;
        }
      }
      group.setItemCount(itemsInGroup);

      this._visualizeGrouping(groups);
      this._syncModelSelectionToView();
      this._syncRowCount();
    },


    _applyModel: function(value, old)
    {
      this.base(arguments, value, old);
      this.__deferredUpdate.schedule();
    },


    _onChangeModel: function(e)
    {
      this.base(arguments, e);
      this.__deferredUpdate.schedule();
    },


    _onChangeBubbleModel : function(e)
    {
      var data = e.getData();
      if (data.name)
      {
        var prop = data.name.toString().split(".")[1];
        if (prop == "name" || prop == "group") {
          this.__deferredUpdate.schedule();
        }
      }

      this.base(arguments);
    }
  }
});