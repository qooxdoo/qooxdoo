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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Oxygen/48/apps/video-player.png)
#asset(qx/icon/Oxygen/48/apps/internet-mail.png)
#asset(qx/icon/Oxygen/48/apps/internet-web-browser.png)
#asset(qx/icon/Oxygen/48/apps/photo-album.png)
#asset(qx/icon/Oxygen/48/apps/office-writer.png)
#asset(qx/icon/Oxygen/16/places/user-home.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Window",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.getRoot().add(this._createTabWindow(), {left: 20, top: 20});
      this.getRoot().add(this._createPropertyWindow(), {left: 250, top: 120});
    },


    _createTabWindow : function()
    {
      var win = new qx.ui.window.Window(
        "First Window",
        "icon/16/categories/internet.png"
      );

      win.getChildrenContainer().setPadding(10);

      win.setLayout(new qx.ui.layout.VBox(10));

      var atom = new qx.ui.basic.Atom(
        "Welcome to your first own Window.<br/>Have fun!",
        "icon/48/apps/internet-mail.png"
      );
      atom.setRich(true);
      win.add(atom);

      var tabview = new qx.ui.tabview.TabView().set({
        allowGrowY: true
      });
      tabview.add(new qx.ui.tabview.Page("Explore"));
      tabview.add(new qx.ui.tabview.Page("Internet"));
      tabview.add(new qx.ui.tabview.Page("Future"));
      win.add(tabview, {flex: 1});

      var handler = function(e)
      {
        console.log(e.getType(), e.getTarget());
        if (e.isCancelable())
        {
          if (window.confirm("Cancel event '"+e.getType()+"'?")) {
            e.preventDefault();
          }
        }
      }


      return win;
    },


    _createPropertyWindow : function()
    {
      var win = new qx.ui.window.Window(
        "Window Properties",
        "icon/16/categories/engineering.png"
      );

      win.getChildrenContainer().setPadding(10);

      win.setLayout(new qx.ui.layout.VBox(10));

      var editor = new demobrowser.demo.util.PropertyGroup({
        "showIcon" : {type: "bool", nullable: false},
        "showCaption" : {type: "bool", nullable: false},
        "showMinimize" : {type: "bool", nullable: false},
        "showMaximize" : {type: "bool", nullable: false},
        "showClose" : {type: "bool", nullable: false},
        "showStatusbar" : {type: "bool", nullable: false},
        "allowMinimize" : {type: "bool", nullable: false},
        "allowMaximize" : {type: "bool", nullable: false},
        "allowClose" : {type: "bool", nullable: false},
        "moveable" : {type: "bool", nullable: false},
        "moveMethod" : {
          type: "enum",
          values: [ "opaque", "frame", "translucent" ],
          nullable: false
        },
        "resizableNorth" : {type: "bool", nullable: false},
        "resizableEast" : {type: "bool", nullable: false},
        "resizableSouth" : {type: "bool", nullable: false},
        "resizableWest" : {type: "bool", nullable: false},
        "resizeMethod" : {
          type: "enum",
          values: [ "opaque", "frame", "translucent" ],
          nullable: false
        }
      });
      editor.setSelected(win);
      win.add(editor, {flex: 1});

      var packBtn = new qx.ui.form.Button("Optimal size").set({
        alignX: "right",
        allowGrowX: false
      });
      packBtn.addListener("execute", function(e) {
        win.resetWidth();
        win.resetHeight();
      }, this);
      win.add(packBtn);

      return win;
    }
  }
});
