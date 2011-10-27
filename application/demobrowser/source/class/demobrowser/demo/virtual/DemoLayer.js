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
   * Fabian Jakobs (fjakobs)
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/places/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.DemoLayer",
{
  extend : qx.ui.virtual.layer.WidgetCell,

  construct : function()
  {
    this.base(arguments, this);
    this._pool = {
      atom : [],
      checkbox : []
    };

    this.__rowData = [];
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _pool : null,
    __rowData : null,

    getCellData : function(row, column)
    {
      if (!this.__rowData[row]) {
        this.__rowData[row] = [];
      }
      if (!this.__rowData[row][column])
      {
        this.__rowData[row][column] = {
          label: this.__generateName(),
          icon: this.__getIcon()
        }
      }
      return this.__rowData[row][column];
    },


    getCellWidget : function(row, column)
    {
      var widget;

      if (column % 2 == 0)
      {
        widget = this._pool.atom.pop();
        if (!widget) {
          widget = new qx.ui.basic.Atom();
          widget.addListener("mouseover", function()
          {
            var icon = this.__getIcon();
            widget.setIcon(icon);
            this.__rowData[row][column].icon = icon;
          }, this);
        }
        widget.set(this.getCellData(row, column));
      }
      else
      {
        widget = this._pool.checkbox.pop();
        if (!widget)
        {
          widget = new qx.ui.form.CheckBox();
          widget.addListener("changeValue", function(){
            this.setLabel(this.getLabel() == "foobar!" ? widget.getUserData("row") + " / " + widget.getUserData("column") : "foobar!");
          }, widget);
        }
        widget.set({
          value : row % 2 == 0,
          label : row + " / " + column
        });
      }

      widget.setUserData("row", row);
      widget.setUserData("column", column);

      return widget;
    },


    poolCellWidget: function(widget) {
      if (widget.classname == "qx.ui.basic.Atom") {
        this._pool.atom.push(widget)
      } else {
        this._pool.checkbox.push(widget)
      }
    },


    __generateName : function()
    {
      var name = "";
      for (var j=0; j<10; j++) {
        name += String.fromCharCode(Math.floor(Math.random()*25)+65);
      }
      return name;
    },

    __getIcon : function()
    {
      var prefix = "icon/";
      var suffix = "places/";

      var iconImages = [
        "folder.png",
        "user-trash.png",
        "network-server.png",
        "network-workgroup.png",
        "user-desktop.png"
      ];

      var imageId = Math.floor(Math.random()*4);

      return (prefix + 16 + "/" + suffix + iconImages[imageId]);
    }
  },

  /*
   *****************************************************************************
      DESTRUCT
   *****************************************************************************
   */

  destruct : function() {
    this._pool = this.__rowData = null;
  }
});
