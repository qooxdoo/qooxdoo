/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * Mobile page responsible for showing the "list" showcase.
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
    _initialize : function()
    {
      this.base(arguments);

      var closePopupButton = new qx.ui.mobile.form.Button("OK");

      var label = new qx.ui.mobile.basic.Label("labelText");
      var popupContent = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
      popupContent.add(label);
      popupContent.add(closePopupButton);

      var popup = new qx.ui.mobile.dialog.Popup(popupContent);
      popup.setModal(true);
      popup.setTitle("Selection");

      closePopupButton.addListener("tap", function() {
        popup.hide();
      }, this);

      var list = new qx.ui.mobile.list.List({
        configureItem: function(item, data, row) {
          item.setImage("mobileshowcase/icon/internet-mail.png");
          item.setTitle(data.title);
          item.setSubtitle(data.subtitle);
          item.setSelectable(row < 4);
          item.setShowArrow(row < 4);
        },

        configureGroup: function(item, data) {
          item.setTitle(data.title);
        }
      });

      var groups = {
        "Selectable" : {
          title : "Selectable"
        },
        "Unselectable" : {
          title : "Not Selectable"
        }
      };
      
      var data = [];
      for (var i = 0; i < 100; i++) {
        data.push({
          title: "Item" + i,
          subtitle: "Subtitle for Item #" + i,
          group: i < 4 ? "Selectable" : "Unselectable"
        });
      }

      list.setGroups(groups);
      list.setModel(new qx.data.Array(data));
      list.addListener("changeSelection", function(evt) {
        var itemNumber = evt.getData();

        label.setValue("You selected Item #" + itemNumber);
        popup.show();
      }, this);
      this.getContent().add(list);
    }
  }
});