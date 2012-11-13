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
     * Tino Butz (tbtz)

************************************************************************ */
/* ************************************************************************

#asset(qx/icon/Tango/22/apps/internet-mail.png)

************************************************************************ */

/**
 * Mobile page responsible for showing the "list" showcase.
 */
qx.Class.define("mobileshowcase.page.List",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("List");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
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

      var list = new qx.ui.mobile.list.List({
        configureItem : function(item, data, row)
        {
          item.setImage("qx/icon/Tango/22/apps/internet-mail.png");
          item.setTitle(row<4 ? ("Selectable " + data.title) : data.title);
          item.setSubtitle(data.subtitle);
          item.setSelectable(row<4);
          item.setShowArrow(row<4);
        }
      });

      var data = [];
      for (var i=0; i < 100; i++) {
        data.push({title:"Item" + i, subtitle:"Subtitle for Item #" + i});
      }

      var closePopupButton = new qx.ui.mobile.form.Button("OK");

      var label = new qx.ui.mobile.basic.Label("labelText");
      var popupContent = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
      popupContent.add(label);
      popupContent.add(closePopupButton);

      var popup = new qx.ui.mobile.dialog.Dialog(popupContent);
      popup.setTitle("Selection");

      closePopupButton.addListener("tap", function() {
        popup.hide();
      }, this);

      list.setModel(new qx.data.Array(data));
      list.addListener("changeSelection", function(evt) {
        var itemNumber = evt.getData();

        label.setValue("You selected Item #" + itemNumber);
        popup.show();
      }, this);
      this.getContent().add(list);
    },


    // overridden
    _back : function()
    {
     qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});