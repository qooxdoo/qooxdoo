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

#asset(qx/icon/${qx.icontheme}/16/apps/preferences-users.png)
#asset(qx/icon/${qx.icontheme}/22/apps/preferences-users.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Menu",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var box = new qx.ui.layout.HBox();
      box.setSpacing(20);

      var container = new qx.ui.container.Composite(box).set({
        padding: [48, 20]
      })
      this.getRoot().add(container);

      container.add(this._getMenu1());
      container.add(this._getMenu2());
      container.add(this._getMenu3());
    },


    _getMenu1 : function()
    {
      var menu = new qx.ui.menu.Menu();

      menu.add(new qx.ui.menu.Button("Hello World #1", "icon/16/apps/preferences-users.png"));
      menu.add(new qx.ui.menu.Button("Hello World #2", "icon/16/apps/preferences-users.png"));
      menu.add(new qx.ui.menu.Button("Hello World #3", "icon/16/apps/preferences-users.png"));
      menu.add(new qx.ui.menu.Button("Hello World #4", "icon/16/apps/preferences-users.png"));
      menu.add(new qx.ui.menu.Button("Hello World #5", "icon/16/apps/preferences-users.png"));
      menu.add(new qx.ui.menu.Button("Hello World #6", "icon/16/apps/preferences-users.png"));

      menu.show();

      return menu;
    },


    _getMenu2 : function()
    {
      var menu = new qx.ui.menu.Menu();
      var sub = new qx.ui.menu.Menu();

      menu.add(new qx.ui.menu.Button("Hello World #1", "icon/16/apps/preferences-users.png", new qx.event.Command("Ctrl-A"), sub));
      menu.add(new qx.ui.menu.Button("Hello World #2 with long text"));
      menu.add(new qx.ui.menu.Button("Hello World #3", null, new qx.event.Command("F11")));
      menu.add(new qx.ui.menu.Button("Hello World #4", "icon/16/apps/preferences-users.png"));
      menu.add(new qx.ui.menu.Button("Hello World #5", "icon/16/apps/preferences-users.png", null, sub));
      menu.add(new qx.ui.menu.Button("Hello World #6", "icon/16/apps/preferences-users.png"));

      menu.show();

      return menu;
    },

    _getMenu3 : function()
    {
      var menu = new qx.ui.menu.Menu();

      menu.add(new qx.ui.menu.Button("Hello World #1"));
      menu.add(new qx.ui.menu.Button("Hello World #2"));
      menu.add(new qx.ui.menu.Button("Hello World #3"));
      menu.add(new qx.ui.menu.Button("Hello World #4"));
      menu.add(new qx.ui.menu.Button("Hello World #5"));
      menu.add(new qx.ui.menu.Button("Hello World #6"));

      menu.show();

      return menu;
    },

  }
});
