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
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/places/*)
#asset(qx/icon/${qx.icontheme}/22/places/*)
#asset(qx/icon/${qx.icontheme}/32/places/*)
#asset(qx/icon/${qx.icontheme}/48/places/*)
#asset(qx/icon/${qx.icontheme}/64/places/*)
#asset(qx/icon/${qx.icontheme}/128/places/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.TableHeader",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      // Fix values:
      var listWidgetHeight = 340;
      var totalAmount = 200;
      var defaultItemHeight = 24;

      var yAxis = new qx.ui.virtual.core.Axis(defaultItemHeight, totalAmount);

//      var listHeight = (visibleItemAmount - 2) * itemHeight;


      var data = [];
      var icon = [];

      var prefix = "icon/";
      var suffix = "places/";

      var iconImages = [
        "folder.png",
        "user-trash.png",
        "network-server.png",
        "network-workgroup.png",
        "user-desktop.png"
      ];

      var sizes = [16, 22, 32, 48, 64, 128];

      // Generate data:
      for (var i=0; i<totalAmount; i++)
      {
        var name = "";
        for (var j=0; j<10; j++) {
          name += String.fromCharCode(Math.floor(Math.random()*25)+65);
        }

        var imageId = Math.floor(Math.random()*4);
        var size = Math.floor(Math.random()*5);

        data.push(name);
        icon.push(prefix + sizes[size] + "/" + suffix + iconImages[imageId]);

        yAxis.setItemSize(i, sizes[size]);
      }

      var visibleItemAmount = yAxis.getItemAtPosition(listWidgetHeight).index;


      this.__data = data;
      this.__icon = icon;
      this.__visibleItemAmount = visibleItemAmount;
      this.__totalAmount = totalAmount;
      this.__yAxis = yAxis;

      var doc = this.getRoot();
      var layout = new qx.ui.layout.HBox();
      var listContainer = new qx.ui.container.Composite(layout);

      var dummyList = new qx.ui.container.Composite(new qx.ui.layout.VBox);
      dummyList.set({
        width : listWidgetHeight,
        backgroundColor : "white"
      });


console.info(visibleItemAmount)

      var item;
      for( var i=0; i<visibleItemAmount; i++ )
      {
        item = new qx.ui.form.ListItem(data[i], icon[i]);
        dummyList.add(item);
      };

      this.__list = dummyList;

      var scrollbar = new qx.ui.core.ScrollBar("vertical");

      scrollbar.set({
        maximum : yAxis.getTotalSize() // TODO: - (listHeight + 2 * itemHeight)
      });

      scrollbar.addListener("scroll", this._onScroll, this);


      this.__scrollbar = scrollbar;

      var scrollPane = new qx.ui.core.ScrollPane;

      scrollPane.set({
        height : listWidgetHeight,
        decorator : "main"
      });

      scrollPane.add(dummyList);

      this.__scrollPane = scrollPane;

      listContainer.add(scrollPane);
      listContainer.add(scrollbar);

      doc.add(listContainer, {left : 20, top : 10 });

    },


    _onScroll : function(e)
    {
      var offset = e.getData();
      var yAxis = this.__yAxis;
      var result = yAxis.getItemAtPosition(offset);

      var itemIndex = result.index;
      var itemOffset = result.offset;

      var listEntries = this.__list.getChildren();

      for(var i=0; i<listEntries.length; i++)
      {
        listEntries[i].setLabel(this.__data[itemIndex + i] + "");
        listEntries[i].setIcon(this.__icon[itemIndex + i]);
      }
      this.__scrollPane.scrollToY(itemOffset);
    }
  }
});
