/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page for showing the "list" showcase.
 */
qx.Class.define("mobileshowcase.page.List",
{
  extend : mobileshowcase.page.Abstract,


  construct : function()
  {
    this.base(arguments);
    this.setTitle("List");
  },


  members :
  {
    // overridden
    /**
     * @lint ignoreDeprecated(alert)
     */
    _initialize: function() {
      this.base(arguments);

      var list = new qx.ui.mobile.list.List({
        configureItem: function(item, data, row) {
          item.setImage("mobileshowcase/icon/internet-mail.png");
          item.setTitle(data.title);
          item.setSubtitle(data.subtitle);
          item.setSelectable(row < 4);
          item.setShowArrow(row < 4);
        },

        configureGroupItem: function(item, data, group) {
          item.setTitle("#" + group + " " + data.title);
          item.setSelectable(true);
        },

        group: function(data, row) {
          return {
            title: row < 4 ? "Selectable Items" : "Unselectable Items"
          };
        }
      });

      list.setModel(this._createModel());

      list.addListener("changeSelection", function(evt) {
        this._showDialog("You selected Item #" + evt.getData());
      }, this);

      list.addListener("changeGroupSelection", function(evt) {
        this._showDialog("You selected Group #" + evt.getData());
      }, this);

      this.getContent().add(list);
    },


    /**
     * Displays a confirm dialog with the passed text.
     * @param text {String} text to display.
     */
    _showDialog: function(text) {
      qx.ui.mobile.dialog.Manager.getInstance().confirm("Selection", text, null, this, ["OK"]);
    },


    /**
     * Creates the model with the example data.
     * @return {qx.data.Array} data array.
     */
    _createModel: function() {
      var data = [];
      for (var i = 0; i < 100; i++) {
        data.push({
          title: "Item #" + i,
          subtitle: "Subtitle for Item #" + i
        });
      }
      return new qx.data.Array(data);
    }
  }
});